import { Handler } from "aws-lambda";

import { handleMessage } from "../../message-handler";
import { Adapter } from "../types";

interface SocksAdapterConfig {
  token: string;
}

interface Event {
  action: "message"; //other actions yet to be defined
  wid: string;
  data: any;
}

export function createSocksAdapter({ token }: SocksAdapterConfig) {
  const apiURL = new URL("https://cotton.socks.so");

  return {
    async to(wid, data) {
      const toUrl = new URL("/to", apiURL);
      await fetch(toUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, wid, data }),
      });
    },

    async toRoom(rid, data) {
      const toRoomUrl = new URL("/to-room", apiURL);
      await fetch(toRoomUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, rid, data }),
      });
    },

    async broadcast(data) {
      const broadcastUrl = new URL("/broadcast", apiURL);
      const p0 = performance.now();
      await fetch(broadcastUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, data }),
      });
      const p1 = performance.now();
      console.log("broadcast time", p1 - p0);
    },

    async join(wid, rid) {
      const joinUrl = new URL("/join", apiURL);
      await fetch(joinUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, wid, rid }),
      });
    },

    async leave(wid, rid) {
      const leaveUrl = new URL("/leave", apiURL);
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

        const message = messageMap.get(data.type);

        if (!message) {
          throw new Error(`Unknown message type: ${data.type}`);
        }

        await handleMessage(message, data, wid);
      };

      return { handler };
    },
  } satisfies Adapter;
}
