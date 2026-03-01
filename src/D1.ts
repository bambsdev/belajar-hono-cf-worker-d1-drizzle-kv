import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { users } from "../schema/schema";
import { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
}

export const d1 = new Hono<{ Bindings: Env }>().basePath("/d1");

d1.get("/setup", async (c) => {
  const db = drizzle(c.env.DB);
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
  return c.text("Table created or already exists!");
});
d1.get("/add", async (c) => {
  const db = drizzle(c.env.DB);
  const newUser = await db
    .insert(users)
    .values({ name: "Ibrohim" })
    .returning()
    .get();

  return c.json(newUser);
});

// Route to get all users
d1.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select().from(users).all();
  return c.json(allUsers);
});
