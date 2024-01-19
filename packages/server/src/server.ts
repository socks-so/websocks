import { Message } from "./message";
import { handleConnect, handleMessage } from "./message-handler";
import { AnyConfig, AnyReceiverMessage } from "./types";
import { Adapter } from "./adapters/types";

import { nanoid } from "nanoid";

import WebSocket from "isomorphic-ws";
import { crypto } from "@cloudflare/workers-types/experimental";

export class SocksSocket {
  private static clientToWid = new Map<SocksSocket, string>();
  private static WidToClient = new Map<string, SocksSocket>();
  private static inRooms = new Map<string, Set<SocksSocket>>();

  constructor(
    public wid: string,
    public ws: WebSocket,
    public context = {} as any,
    public rooms = new Set<string>()
  ) {}

  static get(wid: string) {
    return SocksSocket.WidToClient.get(wid);
  }

  static getInRoom(rid: string) {
    return [...(SocksSocket.inRooms.get(rid) || [])];
  }

  static getAll() {
    return [...SocksSocket.clientToWid.keys()];
  }

  accept() {
    SocksSocket.clientToWid.set(this, this.wid);
    SocksSocket.WidToClient.set(this.wid, this);
  }

  join(rid: string) {
    if (!SocksSocket.inRooms.has(rid)) {
      SocksSocket.inRooms.set(rid, new Set());
    }
    SocksSocket.inRooms.get(rid)?.add(this);

    this.rooms.add(rid);
  }

  leave(rid: string) {
    SocksSocket.inRooms.get(rid)?.delete(this);
    this.rooms.delete(rid);
  }

  to(data: any) {
    this.ws.send(JSON.stringify(data));
  }
}

export class SocksServer {
  constructor(public randomUUID: () => string) {}

  connect<
    TConfig extends AnyConfig,
    TMessageMap extends Map<String, AnyReceiverMessage>,
  >(ws: WebSocket, config: TConfig, messages: TMessageMap) {
    //TODO other events like close, error, quit, etc should be implemented

    ws.addEventListener(
      "message",
      async (event) => {
        try {
          const data = JSON.parse(event.data as string) as Message; //watch out for different environments
          if (data.type !== "connect") {
            throw new Error("connection could not be established");
          }

          const wid = nanoid();

          const context = await handleConnect(config, data);
          this.accept(new SocksSocket(wid, ws, context), messages);
        } catch (error) {
          if (error instanceof Error) {
            ws.send(JSON.stringify({ type: "error", payload: error.message }));
            ws.close();
          }
        }
      },
      {
        once: true,
      }
    );
  }

  accept<TMessageMap extends Map<String, AnyReceiverMessage>>(
    ss: SocksSocket,
    messages: TMessageMap
  ) {
    ss.accept();
    const { wid, ws, context } = ss;

    ws.send(JSON.stringify({ type: "accept", payload: { wid } }));

    ws.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data as string) as Message; //watch out for different environments
        const message = messages.get(data.type);

        if (!message) {
          throw new Error("message not found");
        }

        await handleMessage(message, data, wid, context);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err);
          ws.send(JSON.stringify({ type: "error", payload: err.message }));
        }
      }
    });
  }

  join(wid: string, rid: string) {
    SocksSocket.get(wid)?.join(rid);
  }

  leave(wid: string, rid: string) {
    SocksSocket.get(wid)?.leave(rid);
  }

  to(wid: string, data: any) {
    SocksSocket.get(wid)?.to(data);
  }

  toRoom(rid: string, data: any) {
    SocksSocket.getInRoom(rid).forEach((ws) => ws.to(data));
  }

  broadcast(data: any) {
    SocksSocket.getAll().forEach((ws) => ws.to(data));
  }

  toAdapter(): Omit<Adapter, "create"> {
    return {
      to: this.to,
      toRoom: this.toRoom,
      broadcast: this.broadcast,
      join: this.join,
      leave: this.leave,
    };
  }
}
