import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

const sql = neon(process.env.NEON_DOCSDB_URL!);

async function makeAdmin(email: string) {
  try {
    const result = await sql`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = ${email}
      RETURNING email, role
    `;

    if (result.length === 0) {
      console.error(`No user found with email: ${email}`);
      return;
    }

    console.log(
      `Successfully updated user ${result[0].email} to role: ${result[0].role}`
    );
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw error;
  }
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address.");
    console.log("Usage: npm run make-admin your.email@example.com");
    process.exit(1);
  }

  try {
    await makeAdmin(email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
