import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Define the users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
