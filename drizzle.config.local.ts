import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/users.ts",
  out: "./drizzle", // folder sama, file migrasi dibagi bareng
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.LOCAL_DATABASE_URL!,
  },
});
