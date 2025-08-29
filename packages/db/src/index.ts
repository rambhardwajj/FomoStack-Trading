import { Client } from "pg";

export const client = new Client({
  connectionString: "postgresql://fomostackpg:pgpassword1010@localhost:5432/fomostack",
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Database connected ");
  } catch (error) {
    console.error("Database connection error ", error);
    process.exit(1);
  }
}
