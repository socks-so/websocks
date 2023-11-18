import { describe, test } from "vitest";

import { init } from "../../server/src/index";

import { client } from "../../client/src/node/index";
import { createNodeAdapter } from "../../server/src/adapters/node";

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

    class Point {
      constructor() {
        this.x = 0;
        this.y = 0;
      }
      x: number;
      y: number;
    }

    const sender = s.sender.messages({
      test: s.sender.message().payload(z.string()),
      test2: s.sender
        .message()
        .payload(z.object({ x: z.number(), y: z.number() })),
    });

    const receiver = s.receiver.messages({
      test: s.receiver
        .message()
        .payload(z.string())
        .on(({ payload }) => {
          console.log("[SERVER]: received test message, payload:" + payload);
          sender.test2({ x: 2, y: 3 }).toRoom("test");
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

    type schema = (typeof server)["schema"];

    const cli1 = client<schema>("ws://localhost:8080");
    const cli2 = client<schema>("ws://localhost:8080");

    cli1.on.test2(({ payload }) => {});

    cli1.on.test(({ payload }) => {
      console.log("[CLIENT 1]: received test message, payload:" + payload);
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
