import { init } from "@websocks/server/src/init";
import { createSocksAdapter } from "@websocks/server/src/adapters/cloudflare";
import { z } from "zod";

const s = init({
  header: z.object({ token: z.string() }),
  connect: (header) => {
    console.log(header);
    return {
      user: header.token,
    };
  },
  adapter: createSocksAdapter({
    token: "discord",
  }),
});

const sender = s.sender.messages({
  test: s.sender.message.payload(z.string()),
});

const receiver = s.receiver.messages({
  test: s.receiver.message
    .payload(z.string())
    .on(async ({ context, payload }) => {
      console.log(`We got a message from ${context.user}: ${payload}`);
      await sender.test(`${payload}`).broadcast();
    }),
});

const { WSService, fetch, schema } = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
});

export { WSService };

export default {
  fetch,
};

export type Schema = typeof schema;
