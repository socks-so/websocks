import { WebSocketServer, WebSocket, RawData } from "ws";
import { randomUUID } from "crypto";
import { Adapter } from ".";

export function createNodeAdapter(wss: WebSocketServer) {
  const clientToWid = new Map<WebSocket, string>();
  const widToClient = new Map<string, WebSocket>();

  const rooms = new Map<string, Set<string>>();
  const widInRooms = new Map<string, Set<string>>();

  return {
    to(wid: string, data: unknown) {
      const dataJson = JSON.stringify(data);
      widToClient.get(wid)?.send(dataJson);
    },

    toRoom(rid: string, data: unknown) {
      for (const wid of rooms.get(rid) || []) {
        this.to(wid, data);
      }
    },

    broadcast(data: unknown) {
      for (const ws of clientToWid.keys()) {
        const dataJson = JSON.stringify(data);
        ws.send(dataJson);
      }
    },

    join(wid: string, rid: string) {
      if (!rooms.has(rid)) {
        rooms.set(rid, new Set());
      }
      rooms.get(rid)?.add(wid);

      if (!widInRooms.has(wid)) {
        widInRooms.set(wid, new Set());
      }
      widInRooms.get(wid)?.add(rid);
    },

    leave(wid: string, rid: string) {
      rooms.get(rid)?.delete(wid);
      widInRooms.get(wid)?.delete(rid);
    },

    create(messageMap) {
      wss.on("connection", (ws: WebSocket) => {
        const wid = randomUUID();
        clientToWid.set(ws, wid);
        widToClient.set(wid, ws);
        widInRooms.set(wid, new Set());

        ws.on("message", (data) => {
          const parsedData = parseRawData(data);
          const messageHandle = messageMap.get(parsedData.type);

          if (!messageHandle) {
            ws.send(
              JSON.stringify({ type: "error", payload: "message not found" })
            );
            return;
          }

          const payload = messageHandle.payloadSchema?.safeParse(
            parsedData.payload
          );

          if (!payload?.success) {
            ws.send(
              JSON.stringify({
                type: "error",
                payload: "payload validation failed",
              })
            );
            return;
          }

          const header = {}; //TODO: implement header parsing

          const context = messageHandle.middlewares.reduce(
            (acc, curr) => curr({ header, context: acc }),
            {}
          );

          messageHandle.handler({ payload, header, context });
        });
      });
      return {
        server: wss,
      };
    },
  } satisfies Adapter;
}

function parseRawData(data: RawData) {
  return JSON.parse(data.toString()) as Data;
}

type Data = {
  type: string;
  payload: unknown;
};
