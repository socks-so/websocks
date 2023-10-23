import { Handler } from "aws-lambda";

import { Adapter } from "./types";

interface SocksAdapterConfig {
  token: string;
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
      const handler: Handler = async (event, context) => {
        // ...
      };

      return { handler };
    },
  } satisfies Adapter;
}
