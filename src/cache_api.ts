import { Hono } from "hono";

// Cloudflare Workers punya `caches.default` yang tidak ada di tipe standar TypeScript
declare const caches: CacheStorage & { default: Cache };

/**
 * Cloudflare Cache API Demo
 *
 * Cache API di Cloudflare Workers BUKAN binding (tidak perlu di wrangler.jsonc).
 * Diakses via `caches.default` (atau `caches.open("custom")`).
 * Cache menyimpan Response objects, bukan string biasa.
 * Key-nya berupa URL (Request/string).
 *
 * TTL (Time To Live) dikontrol via Cache-Control header.
 */

const cacheApi = new Hono().basePath("/cache");

cacheApi.get("/", (c) => {
  return c.json({
    message: "Cloudflare Cache API Demo",
    endpoints: {
      "GET /cache/set?key=mykey&value=myvalue&ttl=60":
        "Simpan value ke cache (ttl dalam detik, default 60)",
      "GET /cache/get?key=mykey": "Ambil value dari cache",
      "GET /cache/delete?key=mykey": "Hapus value dari cache",
    },
  });
});

// Helper: buat cache key berupa URL (Cache API butuh URL sebagai key)
function makeCacheKey(key: string, requestUrl: string): string {
  const url = new URL(requestUrl);
  return `${url.origin}/cache-store/${key}`;
}

// SET: Simpan data ke cache
cacheApi.get("/set", async (c) => {
  const key = c.req.query("key") || "default";
  const value = c.req.query("value") || "hello";
  const ttl = parseInt(c.req.query("ttl") || "60");

  const cache = caches.default;
  const cacheKey = makeCacheKey(key, c.req.url);

  // Cache API menyimpan Response, jadi kita bungkus value dalam Response
  const response = new Response(
    JSON.stringify({ value, cachedAt: new Date().toISOString() }),
    {
      headers: {
        "Content-Type": "application/json",
        // Cache-Control menentukan berapa lama data di-cache
        "Cache-Control": `s-maxage=${ttl}`,
      },
    },
  );

  await cache.put(cacheKey, response);

  return c.json({
    success: true,
    key,
    value,
    ttl: `${ttl} detik`,
    cacheKey,
  });
});

// GET: Ambil data dari cache
cacheApi.get("/get", async (c) => {
  const key = c.req.query("key") || "default";

  const cache = caches.default;
  const cacheKey = makeCacheKey(key, c.req.url);

  const cached = await cache.match(cacheKey);

  if (!cached) {
    return c.json({
      hit: false,
      message: "Cache MISS — data tidak ditemukan atau sudah expired",
    });
  }

  const data = await cached.json();
  return c.json({
    hit: true,
    message: "Cache HIT!",
    data,
  });
});

// DELETE: Hapus data dari cache
cacheApi.get("/delete", async (c) => {
  const key = c.req.query("key") || "default";

  const cache = caches.default;
  const cacheKey = makeCacheKey(key, c.req.url);

  const deleted = await cache.delete(cacheKey);

  return c.json({
    success: deleted,
    message: deleted
      ? "Data berhasil dihapus dari cache"
      : "Data tidak ditemukan di cache",
    key,
  });
});

export default cacheApi;
