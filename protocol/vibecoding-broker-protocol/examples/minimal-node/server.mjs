/**
 * Tiny HTTP server implementing VBP path shape for local validator checks.
 */
import http from "node:http";

const PORT = Number(process.env.PORT || 3099);
const json = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = u.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    });
    res.end();
    return;
  }

  if (path === "/vbp/v1/dispatch" && req.method === "POST") {
    json(res, 202, {
      provider_run_id: "demo-run",
      stream_url: `http://127.0.0.1:${PORT}/vbp/v1/stream/demo-run`,
      claim_token: "demo-claim",
      phantom_ttl_hours: 24,
    });
    return;
  }

  if (path.startsWith("/vbp/v1/status/") && req.method === "GET") {
    json(res, 200, { status: "queued", progress: 0 });
    return;
  }

  if (path.startsWith("/vbp/v1/artifacts/") && req.method === "GET") {
    json(res, 200, { preview_url: "https://example.com", tech_stack: ["demo"] });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`VBP minimal demo http://127.0.0.1:${PORT}/vbp/v1`);
});
