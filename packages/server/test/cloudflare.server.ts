import { init } from "../src/index";
import { createSocksAdapter } from "../src/adapters/cloudflare";

import { z } from "zod";
import { WebSocketServer } from "ws";

const s = init({
  adapter: createSocksAdapter({ token: "test" }),
});

const senderMessages = s.sender.messages({
  hello: s.sender.message.payload(z.string()),
});

const receiverMessages = s.receiver.messages({
  helloFromClient: s.receiver.message
    .payload(z.string())
    .on(({ wid, payload }) => {
      console.log(`Hello from client ${wid}, he says: ${payload}`);
    }),
});

const { WSService, fetch, schema } = s.create({
  receiverMessages,
  senderMessages,
});

export type Schema = typeof schema;

export { WSService };

export default {
  fetch,
};
