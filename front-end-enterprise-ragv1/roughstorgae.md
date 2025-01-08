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

## Original Guidelines

```ts
export const defaultGuidelines: Guidelines = {
  // Regulatory Compliance
  regulatory_requirements:
    'Include "AGGRENOX® (aspirin/extended-release dipyridamole) 25mg/200mg capsules"',
  safety_warnings: "Must be prominently displayed for bleeding risks",
  isi_reference: "Reference ISI in all materials",
  industry_code: "PhRMA Code compliance required",
  testimonial_policy: "No patient testimonials without documented verification",
  clinical_data_policy:
    "Clinical data must be from last 5 years unless historically significant",
  statistics_policy: "All statistics must include study reference and date",

  // Medical & Scientific
  clinical_claims: "48% relative risk reduction in stroke vs aspirin alone",
  study_references: "ESPS2 Trial, 1996",
  moa_requirements: "MOA visualization must show both antiplatelet mechanisms",
  terminology_standards:
    'Use "secondary stroke prevention" not "stroke prevention"',
  antiplatelet_terminology: '"Antiplatelet therapy" not "blood thinner"',
  dosing_info: "Twice daily dosing",

  // Brand Identity
  color_palette:
    "Primary: Boehringer Blue (#003366)\nSecondary: Medical White (#FFFFFF)\nAccent: Safety Orange (#FF6633)",
  typography:
    "Headlines: Frutiger Bold\nBody: Frutiger Light\nMinimum size: 8pt for print, 12px for digital",
  logo_requirements:
    "Clear space: 1x height of logo\nMinimum size: 1.5 inches for print\nAlways use ® symbol",

  // Market Specific
  language_requirements:
    "American English spelling\nAvoid regional medical terminology\nInclude Spanish translation option for patient materials",
  healthcare_system:
    "Include insurance coverage information\nMedicare Part D tier status\nPrior authorization requirements",

  // Digital Platform
  size_requirements:
    "Banner ads: 728x90, 300x250, 160x600\nSocial media: 1200x628 (Facebook), 1080x1080 (Instagram)\nEmail headers: 600px width",
  file_specifications:
    "Web: PNG/JPG, max 200KB\nPrint: CMYK, 300dpi minimum\nVideo: MP4, max 30 seconds",

  // MLR Review
  submission_process:
    "Initial review: 5 business days\nRevisions: 3 business days\nFinal approval: 2 business days",
  documentation:
    "Reference validation forms\nClinical data substantiation\nPrevious approval codes",

  // Audience Specific
  hcp_materials:
    "Include prescribing information\nClinical trial data emphasis\nProfessional medical imagery",
  patient_materials:
    "6th-grade reading level\nLifestyle imagery\nClear dosing instructions",
  persona_guidelines:
    "Professional tone for HCPs\nEmpathetic tone for patients\nClear, concise language for all",

  // Technical Specs
  print_requirements: "Bleed: 0.125 inches\nResolution: 300 DPI\nColor: CMYK",
  digital_requirements: "RGB color space\nWeb-safe fonts\nResponsive design",

  // Safety & Risk
  warning_placement:
    "Black box warning: Top 1/3 of page\nSafety information: Minimum 8pt font\nAdverse events: Bullet point format",
  required_statements:
    "Report adverse events to FDA at 1-800-FDA-1088\nPlease see Full Prescribing Information, including boxed WARNING",

  // Accessibility
  accessibility_digital:
    "WCAG 2.1 Level AA compliance\nAlt text for all images\nMinimum contrast ratio: 4.5:1",
  accessibility_print:
    "Minimum 8pt font size\nHigh contrast color combinations\nClear hierarchy of information",

  // Final Steps
  purpose_of_image: "",
  final_prompt: "",
};
```
