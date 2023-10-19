import { init } from "../src";
import { z } from "zod";

const s = init({
  header: z.object({ lol: z.string() }),
  context: () => {
    console.log("first context middleware fn!");
    return {
      user: null,
    };
  },
});

const sender = s.sender.messages({
  greet: s.sender.message().payload(z.object({ username: z.string() })),
  deep: {
    deeper: {
      greet: s.sender.message().payload(z.object({})),
    },
  },
});

const receiver = s.receiver.messages({
  greet: s.receiver
    .message()
    .payload(z.object({ username: z.string() }))
    .on(({ payload, header, context }) => {
      console.log("greet! " + payload.username);
    }),
});

const server = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
});
