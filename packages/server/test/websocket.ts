import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
  console.log("Server started!");
});

wss.on("connection", (ws) => {
  console.log("Client connected!");
  ws.on("message", (data) => {
    console.log(data.toString());
    ws.send(JSON.stringify({ type: "test", payload: "payloadTest" }));
  });
});
