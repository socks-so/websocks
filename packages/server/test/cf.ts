import { init } from "@websocks/server/src/init";
import { createSocksAdapter } from "@websocks/server/src/adapters/cloudflare";
import { z } from "zod";

const s = init({
  adapter: createSocksAdapter({
    token: "discord",
  }),
});

const sender = s.sender.messages({
  test: s.sender.message.payload(z.string()),
});

const receiver = s.receiver.messages({
  test: s.receiver.message.payload(z.string()).on(async ({ payload }) => {
    console.log("Message received:", payload);
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
