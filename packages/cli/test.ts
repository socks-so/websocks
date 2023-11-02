import { init } from "../server/src/index";
import { createSocksAdapter } from "../server/src/adapters/socks";
import { z } from "zod";

const s = init({
  context: () => ({}),
  adapter: createSocksAdapter({
    token: "123",
  }),
});

const sender = s.sender.messages({
  test: s.sender.message().payload(z.string()),
});

const receiver = s.receiver.messages({
  test: s.receiver
    .message()
    .payload(z.string())
    .on(({ payload }) => {
      console.log(payload);
    }),
});

export const handler = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
}).handler;
