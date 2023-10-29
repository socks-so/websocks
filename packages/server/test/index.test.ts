import { describe, it } from "vitest";

import { init } from "../src/index";
import { createNodeAdapter } from "../src/adapters/node";

import { z } from "zod";
import { WebSocketServer } from "ws";

describe("server", () => {
  it("should work", () => {
    const s = init({
      adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
    });

    const authReceiver = s.receiver.use((opts) => {
      return {
        user: "rahul",
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
        .on(({ wid, payload, context }) => {
          console.log("greet2! " + payload.username);
          senderMessages.greet({ username: "WAUUZO!" }).to(wid);
        }),
      auth: {
        login: authReceiver.message().on(({ context }) => {
          console.log("login");
          console.log(context.user);
        }),
        logout: authReceiver.message().on(({ context }) => {}),
      },
    });

    const server = s.create({
      receiverMessages,
      senderMessages,
    });
  });
});
