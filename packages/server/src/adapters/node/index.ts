import { WebSocketServer, WebSocket, RawData } from "ws";
import { SocksServer } from "./server";
import { Adapter } from "../types";

export function createNodeAdapter(wss: WebSocketServer) {
  const server = new SocksServer();

  return {
    ...server.toAdapter(),
    create(config, messages) {
      wss.addListener("connection", (ws) => {
        server.connect(ws, config, messages);
      });

      return {
        wss,
      };
    },
  } satisfies Adapter;
}
