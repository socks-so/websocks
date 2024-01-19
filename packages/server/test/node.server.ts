import { init } from "../src/index";
import { createNodeAdapter } from "../src/adapters/node";

import { z } from "zod";
import { WebSocketServer } from "ws";

const s = init({
  adapter: createNodeAdapter(new WebSocketServer({ port: 8081 })),
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

const server = s.create({
  receiverMessages,
  senderMessages,
});
server.wss.on("listening", () => console.log("server listening"));
