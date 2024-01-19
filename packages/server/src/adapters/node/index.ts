import { WebSocketServer } from "ws";
import { SocksServer } from "../../server";
import { Adapter } from "../types";

import { randomUUID } from "crypto";

export function createNodeAdapter(wss: WebSocketServer) {
  const server = new SocksServer(randomUUID);

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
