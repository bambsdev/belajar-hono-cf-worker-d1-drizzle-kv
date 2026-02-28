import { Hono } from "hono";
import { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { users } from "../db/schema";

export interface Env {
  DB: D1Database;
  KV_BINDING: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/setup", async (c) => {
  const db = drizzle(c.env.DB);
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
  return c.text("Table created or already exists!");
});
app.get("/kvadd", async (c) => {
  await c.env.KV_BINDING.put("school", "Sekolah Merdeka");
  return c.text(`My name is : ${await c.env.KV_BINDING.get("school")}`);
});
app.get("/kvdelete", async (c) => {
  const currentBeforeDeleted = c.env.KV_BINDING.get("name");
  await c.env.KV_BINDING.delete("name");
  return c.text(`success deleted data : ${currentBeforeDeleted}`);
});
app.get("/kvget", async (c) => {
  const value = await c.env.KV_BINDING.get("name");
  const allKeys = await c.env.KV_BINDING.list();
  return c.json({
    value,
    allKeys,
  });
});

// Route to add a test user
app.get("/add", async (c) => {
  const db = drizzle(c.env.DB);
  const newUser = await db
    .insert(users)
    .values({ name: "Ibrohim" })
    .returning()
    .get();

  return c.json(newUser);
});

// Route to get all users
app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select().from(users).all();
  return c.json(allUsers);
});

// Default route
app.get("/", (c) => c.text("Hono!"));

export default app;
