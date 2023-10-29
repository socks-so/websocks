import { init } from "../server/src/index";
import { createNodeAdapter } from "../server/src/adapters/node";
import { WebSocketServer } from "ws";
import z from "zod";

const s = init({
  header: z.string(),
  context: () => "test",
  adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
});

const sender = s.sender.messages({
  test: s.sender.message().payload(z.string()),
});

const receiver = s.receiver.messages({
  test: s.receiver
    .message()
    .payload(z.string())
    .on(({ wid, payload }) => {
      console.log("[SERVER]: received test message, payload:" + payload);
      sender.test("Hi from server").toRoom("test");
    }),
});

const server = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
});

console.log("[SERVER]: started");
