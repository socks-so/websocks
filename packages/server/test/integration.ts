import { init } from "@websocks/server/src/index";
import { WebSocketServer } from "ws";

import { client } from "@websocks/client/src/node";

import { z } from "zod";
import { createNodeAdapter } from "../src/adapter/node";

const s = init(
  { header: z.string(), context: () => "test" },
  createNodeAdapter(new WebSocketServer({ port: 8080 }))
);

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
  joinRoom: s.receiver
    .message()
    .payload(z.object({ rid: z.string() }))
    .on(({ wid, payload }) => {
      console.log("[SERVER]: received joinRoom message, payload:" + payload);
      s.rooms.join(payload.rid, wid);
    }),
});

const server = s.create({
  receiverMessages: receiver,
  senderMessages: sender,
});

type schema = (typeof server)["_schema"];

const cli1 = client<schema>("ws://localhost:8080");
const cli2 = client<schema>("ws://localhost:8080");

cli1.on.test((payload) => {
  console.log("[CLIENT 1]: received test message, payload:", payload);
});

cli2.on.test((payload) => {
  console.log("[CLIENT 2]: received test message, payload:", payload);
});

cli1.on.open(() => {
  cli1.send.joinRoom({ rid: "test" });
});

cli2.on.open(() => {
  cli2.send.joinRoom({ rid: "test" });
});

setTimeout(() => {
  cli1.send.test("Hi from client 1");
}, 1000);
