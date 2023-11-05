import { Handler } from "aws-lambda";

import { handleMessage } from "../message-handler";
import { Adapter } from "./types";

interface SocksAdapterConfig {
  token: string;
}

interface Event {
  action: "message"; //other actions yet to be defined
  wid: string;
  data: any;
}

export function createSocksAdapter({ token }: SocksAdapterConfig) {
  const apiBaseUrl = "https://api.socks.so";

  return {
    async to(wid: string, data: unknown) {
      const toUrl = new URL("/to", apiBaseUrl);
      await fetch(toUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, wid, data }),
      });
    },

    async toRoom(rid: string, data: unknown) {
      const toRoomUrl = new URL("/to-room", apiBaseUrl);
      await fetch(toRoomUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, rid, data }),
      });
    },

    async broadcast(data: unknown) {
      const broadcastUrl = new URL("/broadcast", apiBaseUrl);
      await fetch(broadcastUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, data }),
      });
    },

    async join(wid: string, rid: string) {
      const joinUrl = new URL("/join", apiBaseUrl);
      await fetch(joinUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, wid, rid }),
      });
    },

    async leave(wid: string, rid: string) {
      const leaveUrl = new URL("/leave", apiBaseUrl);
      await fetch(leaveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, wid, rid }),
      });
    },

    create(messageMap) {
      const handler: Handler<Event> = async (event, context) => {
        const { wid, data } = event;
        const { type, payload } = data;

        const message = messageMap.get(type);

        if (!message) {
          throw new Error(`Unknown message type: ${type}`);
        }

        await handleMessage(message, data, wid);
      };

      return { handler };
    },
  } satisfies Adapter;
}
