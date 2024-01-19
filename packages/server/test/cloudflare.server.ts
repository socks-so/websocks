import { init } from "../src/index";
import { createSocksAdapter } from "../src/adapters/cloudflare";

import { z } from "zod";

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
      senderMessages.hello("get lost!").to(wid);
    }),
});

const { fetch, WSService, schema } = s.create({
  receiverMessages,
  senderMessages,
});

export default {
  fetch,
};

export { WSService };

export type Schema = typeof schema;
