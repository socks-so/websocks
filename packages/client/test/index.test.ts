import { describe, it, expect } from "vitest";

import { client } from "../src/index";
import { init } from "../../server/src/index";
import z from "zod";

describe("client", () => {
  it("should work", () => {
    const s = init({ header: z.string(), context: () => {} });

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

    type schema = (typeof server)["_schema"];

    const cli = client<schema>("ws://localhost:8080");

    cli.on.test((payload) => {
      console.log(payload);
    });
  });
});
