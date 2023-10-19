import { Adapter, AdapterArgs, AdapterConfig } from "../adapter";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

export interface NodeConfig extends AdapterConfig {
  adapter: "node";
  port: number;
}

export function createNodeAdapter(
  args: AdapterArgs,
  config: NodeConfig
): Adapter {
  const wss = new WebSocketServer({ ...config });
  const clientToWid = new Map<WebSocket, string>();
  const widToClient = new Map<string, WebSocket>();

  const rooms = new Map<string, Set<string>>();
  const widInRooms = new Map<string, Set<string>>();

  wss.on("connection", (ws: WebSocket) => {
    const wid = randomUUID();
    clientToWid.set(ws, wid);
    widToClient.set(wid, ws);
    widInRooms.set(wid, new Set());

    args.open && args.open(wid);

    ws.on(
      "message",
      (data) =>
        args.message &&
        args.message(clientToWid.get(ws)!, JSON.parse(data.toString()))
    );
  });

  return {
    to(wid, data) {
      widToClient.get(wid)?.send(data);
    },

    toRoom(rid, data) {
      for (const wid of rooms.get(rid) || []) {
        this.to(wid, data);
      }
    },

    broadcast(data) {
      for (const ws of clientToWid.keys()) {
        ws.send(data);
      }
    },

    join(wid, rid) {
      if (!rooms.has(rid)) {
        rooms.set(rid, new Set());
      }
      rooms.get(rid)?.add(wid);

      if (!widInRooms.has(wid)) {
        widInRooms.set(wid, new Set());
      }
      widInRooms.get(wid)?.add(rid);
    },

    leave(wid, rid) {
      rooms.get(rid)?.delete(wid);
      widInRooms.get(wid)?.delete(rid);
    },
  };
}
