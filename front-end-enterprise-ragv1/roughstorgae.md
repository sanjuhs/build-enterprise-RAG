Let me break down the issue and solution step by step:

1. First, look at how ReactMarkdown renders code blocks:

````markdown
```css
body {
  margin: 0;
}
```
````

````

2. ReactMarkdown converts this into HTML like this:
```html
<pre>
  <code class="language-css">
    body { margin: 0; }
  </code>
</pre>
````

3. In our current code, we're handling it wrong:

```typescript
components={{
  pre: ({ children, className }) => (
    <MarkdownCode className={className}>{children}</MarkdownCode>
  ),
  code: ({ children }) => (
    <MarkdownCode className={className}>{children}</MarkdownCode> // This is wrong
  ),
}}
```

4. The fix should be:

```typescript
components={{
  pre: ({ children }) => {
    // Get the code element's props
    const codeElement = children?.props;
    return (
      <MarkdownCode className={codeElement?.className}>
        {codeElement?.children}
      </MarkdownCode>
    );
  },
  // Remove or simplify the code component
  code: ({ children, inline }) => {
    if (inline) {
      return <code className="bg-muted px-1 rounded">{children}</code>;
    }
    return children;
  },
}}
```

5. Let's update the ChatMessage component with this fix:

```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    pre: ({ children }) => {
      const codeProps = children?.props;
      console.log("Code props:", codeProps); // Debug log
      return (
        <MarkdownCode className={codeProps?.className}>
          {codeProps?.children}
        </MarkdownCode>
      );
    },
    code: ({ children, inline }) => {
      if (inline) {
        return <code className="bg-muted px-1 rounded">{children}</code>;
      }
      return children;
    },
    // ... other components stay the same ...
  }}
>
```

This should fix the language detection because:

1. We're getting the language from the correct element (code, not pre)
2. We're handling inline code differently from code blocks
3. We're properly passing the className that contains the language information

Would you like me to provide the complete updated code?

auth.ts

```ts
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import type { Session } from "next-auth";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env variable is not defined");
}

const sql = neon(process.env.DATABASE_URL!);

interface ExtendedUser extends User {
  role: "guest" | "user" | "admin";
}

interface ExtendedJWT extends JWT {
  role: "guest" | "user" | "admin";
}

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

async function createUser(
  email: string,
  password: string,
  name: string
): Promise<ExtendedUser> {
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
    return { ...result[0], id: result[0].id.toString() } as ExtendedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function verifyUser(
  email: string,
  password: string
): Promise<ExtendedUser | null> {
  const result = await sql`
    SELECT id::text, email, name, role
    FROM users 
    WHERE email = ${email} 
    AND password_hash = crypt(${password}, password_hash)
  `;
  return result[0]
    ? ({ ...result[0], id: result[0].id.toString() } as ExtendedUser)
    : null;
}

async function createGuestUser(email: string): Promise<ExtendedUser> {
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
  return { ...result[0], id: result[0].id.toString() } as ExtendedUser;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          if (credentials.action === "signup") {
            const { email, password, name } = await signUpSchema.parseAsync(
              credentials
            );
            return (await createUser(email, password, name)) as ExtendedUser;
          }

          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          if (email.startsWith("guest_")) {
            return (await createGuestUser(email)) as ExtendedUser;
          }

          const user = await verifyUser(email, password);
          return user as ExtendedUser | null;
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
        token.role = (user as ExtendedUser).role as "guest" | "user" | "admin";
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as ExtendedUser).role = token.role as
          | "guest"
          | "user"
          | "admin";
      }
      return session;
    },
  },
});

// Helper function to check user roles
export function hasRequiredRole(
  session: Session | null,
  requiredRoles: ("guest" | "user" | "admin")[]
) {
  return (
    session?.user &&
    "role" in session.user &&
    requiredRoles.includes((session.user as ExtendedUser).role)
  );
}
```
