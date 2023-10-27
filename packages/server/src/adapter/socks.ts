import { Handler } from "aws-lambda";

import { Adapter } from "./types";

interface SocksAdapterConfig {
  token: string;
}

interface Event {
  wid: string;
  type: string;
  payload: unknown;
}

import { handleMessage } from "../message-handler";

export function createSocksAdapter(config: SocksAdapterConfig) {
  return {
    to(wid: string, data: unknown) {
      //api.socks.so/to -> { wid, message }
    },

    toRoom(rid: string, data: unknown) {
      //api.socks.so/to-room -> { rid, message }
    },

    broadcast(data: unknown) {
      //api.socks.so/broadcast { message }
    },

    join(wid: string, rid: string) {
      //api.socks.so/join -> { wid, rid }
    },

    leave(wid: string, rid: string) {
      //api.socks.so/leave -> { wid, rid }
    },

    create(messageMap) {
      const handler: Handler<Event> = async (event, context) => {
        console.log(event);
        const { wid, type, payload } = event;
        const data = { type, payload };

        const message = messageMap.get(type);

        if (!message) {
          throw new Error(`Unknown message type: ${type}`);
        }

        handleMessage(message, data, wid);
      };

      return { handler };
    },
  } satisfies Adapter;
}
