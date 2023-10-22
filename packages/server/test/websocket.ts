import { init } from "@websocks/server/src/index";
import { z } from "zod";
import { createNodeAdapter } from "../src/adapter/node";
import { WebSocketServer } from "ws";

function logger() {
  console.log("MESSAGE RECEIVED AT" + Date.now().toString());
}

const s = init(
  {
    header: z.object({ lol: z.string() }),
    context: logger,
  },
  createNodeAdapter(new WebSocketServer({ port: 8080 }))
);

const authReceiver = s.receiver.use((opts) => {
  console.log("second auth middleware fn!");
  return {
    user: "rahul",
    time: Date.now(),
  };
});

const senderMessages = s.sender.messages({
  greet: s.sender.message().payload(z.object({ username: z.string() })),
  deep: {
    greeter: s.sender.message().payload(z.object({ username: z.string() })),
  },
});

const receiverMessages = s.receiver.messages({
  greet: s.receiver
    .message()
    .payload(z.object({ username: z.string() }))
    .on(({ payload, header, context }) => {
      senderMessages.greet({ username: "DAZN" }).broadcast();
    }),
  auth: {
    login: authReceiver.message().on(({ header, context }) => {
      console.log(context.user);
    }),
    logout: authReceiver.message().on(({ header, context }) => {}),
  },
});

senderMessages.greet({ username: "rahul" }).broadcast();

const server = s.create({
  receiverMessages,
  senderMessages,
});
