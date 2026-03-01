import { Hono } from "hono";
import { D1Database } from "@cloudflare/workers-types";
import { kv } from "./kv";
import { d1 } from "./D1";
import { hyperdrive } from "./hyperdrive";

const app = new Hono();

app.get("/", (c) => c.text("Hono!"));

app.notFound((c) => {
  return c.text("Waduh, halaman tidak ditemukan!", 404);
});

app.route("/", kv);
app.route("/", d1);
app.route("/", hyperdrive);

export default app;
