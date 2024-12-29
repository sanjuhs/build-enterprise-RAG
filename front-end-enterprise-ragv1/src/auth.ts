import type { DefaultSession, Session } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

const sql = neon(process.env.NEON_DOCSDB_URL!);

// Define our custom types
type UserRole = "guest" | "user" | "admin";

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
  }
}

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  action: z.string().optional(),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  action: z.string(),
});

async function createUser(email: string, password: string, name: string) {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (
        ${email}, 
        crypt(${password}, gen_salt('bf')), 
        ${name},
        'user'
      )
      RETURNING id::text, email, name, role
    `;

    if (!result[0]) {
      throw new Error("Failed to create user");
    }

    return {
      id: result[0].id.toString(),
      name: result[0].name,
      email: result[0].email,
      role: result[0].role as UserRole,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function verifyUser(email: string, password: string) {
  const result = await sql`
    SELECT id::text, email, name, role
    FROM users 
    WHERE email = ${email} 
    AND password_hash = crypt(${password}, password_hash)
  `;

  if (!result[0]) return null;

  return {
    id: result[0].id.toString(),
    name: result[0].name,
    email: result[0].email,
    role: result[0].role as UserRole,
  };
}

async function createGuestUser(email: string) {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (
      ${email}, 
      crypt('guest-pass', gen_salt('bf')), 
      'Guest User',
      'guest'
    )
    RETURNING id::text, email, name, role
  `;

  if (!result[0]) {
    throw new Error("Failed to create guest user");
  }

  return {
    id: result[0].id.toString(),
    name: result[0].name,
    email: result[0].email,
    role: result[0].role as UserRole,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          if (!credentials) return null;

          if (credentials.action === "signup") {
            const { email, password, name } = await signUpSchema.parseAsync(
              credentials
            );
            return await createUser(email, password, name);
          }

          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          if (email.startsWith("guest_")) {
            return await createGuestUser(email);
          }

          return await verifyUser(email, password);
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});

// Helper function to check user roles
export function hasRequiredRole(
  session: Session | null,
  requiredRoles: UserRole[]
) {
  return (
    session?.user &&
    session.user.role &&
    requiredRoles.includes(session.user.role)
  );
}
