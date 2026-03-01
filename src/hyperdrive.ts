import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { Hono } from "hono";
import { Hyperdrive } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import { users } from "../schema/users";

export interface Env {
  HYPERDRIVE: Hyperdrive;
}

export const hyperdrive = new Hono<{ Bindings: Env }>().basePath("/hyper");

// Middleware — inisiasi client & drizzle sekali di sini,
// lalu simpan ke context supaya semua route bisa pakai
hyperdrive.use("*", async (c, next) => {
  const client = new Client({
    connectionString: c.env.HYPERDRIVE.connectionString,
  });

  await client.connect();
  const db = drizzle(client, { schema: { users } });

  c.set("db" as never, db);
  c.set("client" as never, client);

  await next();

  // Tutup koneksi setelah request selesai
  await client.end();
});

// GET /hyper/users — ambil semua user
hyperdrive.get("/users", async (c) => {
  const db = c.get("db" as never) as ReturnType<typeof drizzle>;

  try {
    const result = await db.select().from(users);
    return c.json({ result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : e }, 500);
  }
});

// GET /hyper/users/:id — ambil user by id
hyperdrive.get("/users/:id", async (c) => {
  const db = c.get("db" as never) as ReturnType<typeof drizzle>;
  const id = Number(c.req.param("id"));

  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return c.json({ result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : e }, 500);
  }
});
