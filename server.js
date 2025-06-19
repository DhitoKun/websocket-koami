const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

let observers = [];

app.get("/", (req, res) => {
  res.send("✅ Koami OBS Relay Server is running.");
});

app.get("/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  res.flushHeaders();
  observers.push(res);
  console.log("🔌 OBS Plugin connected");

  const interval = setInterval(() => {
    if (!res.writableEnded) res.write("data: ping\n\n");
  }, 25000);

  req.on("close", () => {
    observers = observers.filter(r => r !== res);
    clearInterval(interval);
    console.log("❌ OBS Plugin disconnected");
  });
});

app.get("/send", (req, res) => {
  const action = req.query.action;
  if (!["start", "stop"].includes(action)) return res.status(400).send("❌ Invalid action");

  observers.forEach(r => r.write(`data: ${action}\n\n`));
  res.send(`✅ Sent '${action}' to ${observers.length} plugin(s)`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Koami server running on ${PORT}`);
});
