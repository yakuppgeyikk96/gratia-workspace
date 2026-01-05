import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
// Note: Supabase pooler already handles connection pooling
// Keep local pool small to avoid double-pooling overhead
const client = postgres(connectionString, {
  max: 1, // Single connection (Supabase pooler handles the rest)
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client);

// Test connection function
export const testPostgresConnection = async () => {
  try {
    const result = await client`SELECT version()`;
   
    console.log("✅ PostgreSQL Connected:", result[0]?.version);
    
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error);
    throw error;
  }
};
