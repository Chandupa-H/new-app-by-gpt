// signaling-server.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });
let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("message", (message) => {
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message); // relay message to others
      }
    });
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

console.log("Signaling server running on ws://localhost:3001");
