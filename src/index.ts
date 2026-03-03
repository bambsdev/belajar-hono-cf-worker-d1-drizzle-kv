import { Hono } from "hono";
import { kv } from "./kv";
import { hyperdrive } from "./hyperdrive";
import analyticsEngine from "./analytics_engine";
import cacheApi from "./cache_api";

const app = new Hono();

app.get("/", (c) => c.text("Hono!"));

app.notFound((c) => {
  return c.text("Waduh, halaman tidak ditemukan!", 404);
});

app.route("/", kv);
// app.route("/", d1);
app.route("/", hyperdrive);
app.route("/", analyticsEngine);
app.route("/", cacheApi);

export default app;
