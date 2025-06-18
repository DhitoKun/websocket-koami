const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connectedClients = [];

wss.on("connection", (ws) => {
  console.log("🔌 OBS Plugin connected");
  connectedClients.push(ws);

  ws.on("close", () => {
    connectedClients = connectedClients.filter(c => c !== ws);
    console.log("❌ OBS Plugin disconnected");
  });

  ws.on("message", (msg) => {
    console.log("📩 Message from OBS Plugin:", msg.toString());
  });
});

app.get("/", (req, res) => {
  res.send("✅ OBS WebSocket relay is running.");
});

app.get("/send", (req, res) => {
  const action = req.query.action;
  if (!["start", "stop"].includes(action)) {
    return res.status(400).send("❌ Invalid action. Use 'start' or 'stop'");
  }

  connectedClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(action);
    }
  });

  console.log(`📤 Sent action: ${action} to ${connectedClients.length} plugin(s)`);
  res.send(`✅ Action '${action}' sent to OBS plugin(s).`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
