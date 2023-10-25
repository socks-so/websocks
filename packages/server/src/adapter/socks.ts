import { Handler } from "aws-lambda";

import { Adapter } from "./types";

interface SocksAdapterConfig {
  token: string;
}

interface Event {
  type: string;
  payload: unknown;
}

export function createSocksAdapter(config: SocksAdapterConfig) {
  return {
    to(wid: string, data: unknown) {},

    toRoom(rid: string, data: unknown) {
      // ...
    },

    broadcast(data: unknown) {
      // ...// ...
    },

    join(wid: string, rid: string) {
      // ...
    },

    leave(wid: string, rid: string) {
      // ...
    },

    create(messageMap) {
      const handler: Handler<Event> = async (event, context) => {
        const { type, payload } = event;
      };

      return { handler };
    },
  } satisfies Adapter;
}
