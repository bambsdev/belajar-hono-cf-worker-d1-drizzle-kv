import { Hono } from "hono";

interface Env {
  AUDIT_LOG: AnalyticsEngineDataset;
  CF_ACCOUNT_ID: string;
  CF_API_TOKEN: string;
}

const analyticsEngine = new Hono<{ Bindings: Env }>().basePath("/analytics");

analyticsEngine.get("/", (c) => {
  return c.text("Analytics Engine");
});

analyticsEngine.get("/add", async (c) => {
  const action = c.req.query("action") || "click";
  const userId = c.req.query("userId") || "ibrohim";
  await c.env.AUDIT_LOG.writeDataPoint({
    blobs: [action, userId],
    doubles: [Date.now()],
  });
  return c.json({ success: true });
});

analyticsEngine.get("/get", async (c) => {
  const query = `
    SELECT
      blob1 AS action,
      blob2 AS userId,
      double1 AS timestamp
    FROM audit_log
    ORDER BY timestamp DESC
    LIMIT 10
  `;

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${c.env.CF_ACCOUNT_ID}/analytics_engine/sql`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.CF_API_TOKEN}`,
      },
      body: query,
    },
  );

  if (!resp.ok) {
    return c.json({ error: "Failed to fetch analytics data" }, 500);
  }

  const data = await resp.json();
  return c.json(data);
});

export default analyticsEngine;
