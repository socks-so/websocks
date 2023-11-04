import { init } from "../server/src/index";
import { createSocksAdapter } from "../server/src/adapters/socks";
import { z } from "zod";

const s = init({
  context: () => ({}),
  adapter: createSocksAdapter({
    token: "discord",
  }),
});

const sender = s.sender.messages({
  test: s.sender.message().payload(z.string()),
});

const receiver = s.receiver.messages({
  test: s.receiver
    .message()
    .payload(z.string())
    .on(async ({ payload }) => {
      console.log("Message received:", payload);
      await sender.test("Server sending message! " + payload).broadcast();
    }),
});

const server = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
});

export const handler = server.handler;

export type Schema = (typeof server)["_schema"];
