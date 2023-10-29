import { describe, test } from "vitest";

import { init } from "../server/src/index";

import { client } from "@websocks/client/src/node/index";
import { createNodeAdapter } from "../server/src/adapter/node";

import { z } from "zod";
import { WebSocketServer } from "ws";

describe("integration test", () => {
  // const consoleMock = vi
  //   .spyOn(console, "log")
  //   .mockImplementation(() => undefined);

  // afterAll(() => {
  //   consoleMock.mockReset();
  // });

  test("should integrate", async (ctx) => {
    const s = init({
      context: () => "test",
      adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
    });

    const betterReceiver = s.receiver.use((ctx) => {
      console.log("better receiver:");
      return ctx;
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
      betterTest: betterReceiver
        .message()
        .payload(z.string())
        .on(({ payload }) => {
          console.log(
            "[SERVER]: received betterTest message, payload:" + payload
          );
        }),
      joinRoom: s.receiver
        .message()
        .payload(z.object({ rid: z.string() }))
        .on(({ wid, payload }) => {
          console.log(
            "[SERVER]: received joinRoom message, payload:" + payload
          );
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

    await new Promise((resovle) =>
      setTimeout(() => {
        cli1.send.test("Hi from client 1");
        cli2.send.betterTest("better Hi from client 2");
        resovle(null);
      }, 1000)
    );
  });
});
