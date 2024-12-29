import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DOCSDB_URL!);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createUser(
  email: string,
  password: string,
  name: string
) {
  const users = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (
      ${email}, 
      crypt(${password}, gen_salt('bf')), 
      ${name}
    )
    RETURNING id, email, name
  `;
  return users[0];
}
