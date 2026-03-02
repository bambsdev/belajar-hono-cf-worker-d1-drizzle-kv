import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Hono } from "hono";
import { Hyperdrive } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import { users } from "./schema/users";

const schema = { users };

export interface Env {
  HYPERDRIVE: Hyperdrive;
  LOCAL_DATABASE_URL: string;
}

type AppEnv = {
  Bindings: Env;
  Variables: {
    db: NodePgDatabase<typeof schema>;
  };
};

export const hyperdrive = new Hono<AppEnv>().basePath("/hyper");

function getDb(env: Env) {
  const pool = new Pool({
    connectionString: env.LOCAL_DATABASE_URL || env.HYPERDRIVE.connectionString,
  });
  return drizzle(pool, { schema });
}

hyperdrive.use("*", async (c, next) => {
  const db = getDb(c.env);
  c.set("db", db);
  await next();
});

// GET /hyper/users
hyperdrive.get("/users", async (c) => {
  try {
    const result = await c.get("db").select().from(users);
    return c.json({ result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : e }, 500);
  }
});

// GET /hyper/users/:id
hyperdrive.get("/users/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const result = await c
      .get("db")
      .select()
      .from(users)
      .where(eq(users.id, id));
    return c.json({ result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : e }, 500);
  }
});
