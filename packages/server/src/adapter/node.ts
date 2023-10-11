import { Adapter } from "../adapter";
import { WebSocketServer, WebSocket } from "ws";

export class NodeAdapter implements Adapter {
  private wss: WebSocketServer;
  private clientsToWS: Map<string, WebSocket> = new Map();
  private wsToClients: Map<WebSocket, string> = new Map();
  private clientsToRooms: Map<string, Set<string>> = new Map();
  private roomsToClients: Map<string, Set<string>> = new Map();

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });

    this.wss.on("connection", (ws) => {
      const wid = Math.random().toString();
      this.clientsToWS.set(wid, ws);
      this.wsToClients.set(ws, wid);

      ws.on("close", () => {
        this.clientsToWS.delete(wid);
        this.wsToClients.delete(ws);
      });
    });
  }

  to(wid: string, data: any) {
    this.clientsToWS.get(wid)?.send(data);
  }

  toRoom(rid: string, data: any) {
    this.roomsToClients.get(rid)?.forEach((wid) => {
      this.to(wid, data);
    });
  }

  broadcast(data: any) {
    this.clientsToWS.forEach((ws) => {
      ws.send(data);
    });
  }

  message(handler: (wid: string, data: any) => void) {}

  open(fn: (wid: string) => void) {}

  close(fn: (wid: string) => void) {}

  drain(fn: () => void) {}

  join(wid: string, rid: string) {
    const rooms = this.clientsToRooms.get(wid) ?? new Set();
    rooms.add(rid);
    this.clientsToRooms.set(wid, rooms);

    const clients = this.roomsToClients.get(rid) ?? new Set();
    clients.add(wid);
    this.roomsToClients.set(rid, clients);
  }

  leave(wid: string, rid: string) {
    const rooms = this.clientsToRooms.get(wid);
    if (rooms) {
      rooms.delete(rid);
    }

    const clients = this.roomsToClients.get(rid);
    if (clients) {
      clients.delete(wid);
    }
  }
}
