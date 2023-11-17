import { describe, it, expect } from "vitest";

import { client } from "../src/node/index";
import { init } from "../../server/src/index";
import { createNodeAdapter } from "../../server/src/adapters/node";
import { z } from "zod";
import { WebSocketServer } from "ws";

describe("client", () => {
  it("should work", () => {
    const wss = new WebSocketServer({ port: 8080 });

    const s = init({
      context: () => ({}),
      adapter: createNodeAdapter(wss),
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

    type Schema = typeof server.schema;

    const cli = client<Schema>("ws://localhost:8080");

    cli.on.test((payload) => {
      console.log(payload);
    });
  });
});
