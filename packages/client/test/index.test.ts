import { describe, it } from "vitest";
import { WebSocketServer } from "ws";
import z from "zod";

import { createClient } from "../src/node";
import { init } from "../../server/src/index";
import { createNodeAdapter } from "../../server/src/adapters/node";

describe("client", () => {
  it("should work", () => {
    const s = init({
      connect: () => {},
      adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
    });

    const receiver = s.receiver.messages({
      test: s.receiver
        .message()
        .payload(z.string())
        .on(() => {
          console.log("test2");
        }),
    });

    const sender = s.sender.messages({
      test: s.sender.message().payload(z.string()),
    });

    const server = s.create({
      receiverMessages: receiver,
      senderMessages: sender,
    });

    type Schema = typeof server.schema;

    const cli = createClient<Schema>("ws://localhost:8080");

    cli.connect();

    cli.on.test((payload) => {
      console.log(payload);
    });
  });
});
