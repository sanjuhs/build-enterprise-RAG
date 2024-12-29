This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

1. Create a new database in Neon Dashboard
2. Copy the connection string and set it as `NEON_DOCSDB_URL` in your `.env.local`
3. Run the database setup script:
   ```bash
   npm run setup-db
   # or
   yarn setup-db
   # or
   pnpm setup-db
   ```

### Making yourself an admin

After setting up your account, you can make yourself an admin by running this SQL query in the Neon SQL Editor:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your.email@example.com';
```

### Managing User Roles

You can make a user an admin in two ways:

1. Using the Neon SQL Editor:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your.email@example.com';
```

2. Using the CLI command:

```bash
npm run make-admin your.email@example.com
# or
yarn make-admin your.email@example.com
# or
pnpm make-admin your.email@example.com
```
