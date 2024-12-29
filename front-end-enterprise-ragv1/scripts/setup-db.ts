import { setupDatabase } from "../src/lib/db/setup";

async function main() {
  try {
    await setupDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Failed to setup database:", error);
    process.exit(1);
  }
}

main();
