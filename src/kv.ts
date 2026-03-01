import { Hono } from "hono";

export interface Env {
  KV_BINDING: KVNamespace;
}

export const kv = new Hono<{ Bindings: Env }>().basePath("/kv");

kv.get("/add", async (c) => {
  await c.env.KV_BINDING.put("school", "Sekolah Merdeka");
  return c.text(`My name is : ${await c.env.KV_BINDING.get("school")}`);
});
kv.get("/delete", async (c) => {
  const currentBeforeDeleted = c.env.KV_BINDING.get("name");
  await c.env.KV_BINDING.delete("name");
  return c.text(`success deleted data : ${currentBeforeDeleted}`);
});
kv.get("/get", async (c) => {
  const value = await c.env.KV_BINDING.get("name");
  const allKeys = await c.env.KV_BINDING.list();
  return c.json({
    value,
    allKeys,
  });
});
