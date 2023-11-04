import { Handler } from "aws-lambda";

import { Adapter } from "./types";

interface SocksAdapterConfig {
  token: string;
}

interface Event {
  action: "message"; //other actions yet to be defined
  wid: string;
  data: any;
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

    async broadcast(data: unknown) {
      console.log("Broadcasting", data);
      await fetch(
        "https://i7665hzd84.execute-api.eu-central-1.amazonaws.com/service/broadcast",
        {
          method: "POST",
          body: JSON.stringify({
            token: config.token,
            data,
          }),
        }
      );
      console.log("Broadcasted");
    },

    join(wid: string, rid: string) {
      //api.socks.so/join -> { wid, rid }
    },

    leave(wid: string, rid: string) {
      //api.socks.so/leave -> { wid, rid }
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
