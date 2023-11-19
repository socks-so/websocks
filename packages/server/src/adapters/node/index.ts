import { WebSocketServer, WebSocket, RawData } from "ws";
import { randomUUID } from "crypto";

import { handleMessage } from "../../message-handler";
import { Adapter } from "../types";
import { Message } from "../../message";

export function createNodeAdapter(wss: WebSocketServer) {
  const clientToWid = new Map<WebSocket, string>();
  const widToClient = new Map<string, WebSocket>();

  const rooms = new Map<string, Set<string>>();
  const widInRooms = new Map<string, Set<string>>();

  return {
    async to(wid, data) {
      widToClient.get(wid)?.send(JSON.stringify(data));
    },

    async toRoom(rid, data) {
      for (const wid of rooms.get(rid) || []) {
        this.to(wid, data);
      }
    },

    async broadcast(data) {
      console.log(data);
      for (const ws of clientToWid.keys()) {
        ws.send(JSON.stringify(data));
      }
    },

    async join(wid, rid) {
      if (!rooms.has(rid)) {
        rooms.set(rid, new Set());
      }
      rooms.get(rid)?.add(wid);

      if (!widInRooms.has(wid)) {
        widInRooms.set(wid, new Set());
      }
      widInRooms.get(wid)?.add(rid);
    },

    async leave(wid, rid) {
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
          try {
            const parsedData = parseRawData(data);
            const message = messageMap.get(parsedData.type);

            if (!message) {
              return ws.send(
                JSON.stringify({ type: "error", payload: "message not found" })
              );
            }

            handleMessage(message, parsedData, wid);
          } catch (err) {
            if (err instanceof Error) {
              console.log(err);
              ws.send(JSON.stringify({ type: "error", payload: err.message }));
            }
          }
        });
      });
      return {
        server: wss,
      };
    },
  } satisfies Adapter;
}

function parseRawData(data: RawData) {
  return JSON.parse(data.toString()) as Message;
}
