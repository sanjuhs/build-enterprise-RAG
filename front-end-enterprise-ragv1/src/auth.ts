import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);

interface ExtendedUser extends User {
  isGuest?: boolean;
}

interface ExtendedJWT extends JWT {
  isGuest?: boolean;
}

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// interface DbUser {
//   id: string;
//   email: string;
//   name: string;
//   isGuest: boolean;
// }

async function verifyUser(
  email: string,
  password: string
): Promise<User | null> {
  const result = await sql`
    SELECT id::text, email, name, is_guest as "isGuest"
    FROM users 
    WHERE email = ${email} 
    AND password_hash = crypt(${password}, password_hash)
  `;
  const user = result[0];
  return user ? ({ ...user, id: user.id.toString() } as User) : null;
}

async function createGuestUser(email: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, is_guest)
    VALUES (
      ${email}, 
      crypt('guest-pass', gen_salt('bf')), 
      'Guest User',
      true
    )
    RETURNING id::text, email, name, is_guest as "isGuest"
  `;
  const user = result[0];
  return { ...user, id: user.id.toString() } as User;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          // Handle guest login
          if (email.startsWith("guest_")) {
            return await createGuestUser(email);
          }

          // Verify against database
          const user = await verifyUser(email, password);
          if (user) return user;

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        token.id = user.id as string;
        token.isGuest = (user as ExtendedUser).isGuest;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isGuest = token.isGuest as boolean | undefined;
      }
      return session;
    },
  },
});
