import server from "./dist/server/index.js";

const handler = server.fetch.bind(server);
console.log('Vercel root handler type', typeof handler, 'hasFetch', server && typeof server.fetch, 'keys', Object.keys(server));

export default async function (req, res) {
  try {
    const host = req.headers.host || "localhost";
    const response = await handler(new Request(`http://${host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
    }));

    res.statusCode = response.status;

    for (const [key, value] of response.headers) {
      res.setHeader(key, value);
    }

    if (response.body) {
      const buffer = Buffer.from(await response.arrayBuffer());
      res.end(buffer);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Server error:", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
