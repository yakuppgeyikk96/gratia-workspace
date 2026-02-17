import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Select connection string based on environment
const isDevelopment = process.env.NODE_ENV === "development";
const connectionString = isDevelopment
  ? process.env.DATABASE_URL_LOCAL
  : process.env.DATABASE_URL_PRODUCTION;

if (!connectionString) {
  throw new Error(
    `DATABASE_URL_${isDevelopment ? "LOCAL" : "PRODUCTION"} environment variable is not set`
  );
}

console.log(
  `🗄️  Using ${isDevelopment ? "LOCAL" : "PRODUCTION"} PostgreSQL database`
);

// Create postgres client
// Supabase pooler (port 6543, transaction mode) handles backend connection management.
// App-side pool controls how many concurrent queries WE can send to the pooler.
// max:10 is safe — Supabase free tier backend limit is ~60, and pooler multiplexes above that.
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client);

// Close all connections gracefully
export const disconnectPostgres = async () => {
  await client.end();
  console.log("PostgreSQL disconnected");
};

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
