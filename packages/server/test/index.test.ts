import { describe, it } from "vitest";

import { init } from "@websocks/server/src/index";
import { z } from "zod";
import { createNodeAdapter } from "../src/adapter/node";
import { WebSocketServer } from "ws";

describe("server", () => {
  it("should work", () => {
    const s = init(
      {
        header: z.object({ lol: z.string() }),
        context: () => {
          console.log("first context middleware fn!");
          return {
            user: null,
          };
        },
      },
      createNodeAdapter(new WebSocketServer({ port: 8080 }))
    );

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
        .on(({ payload, header, context }) => {
          console.log("greet2! " + payload.username);
          senderMessages.greet({ username: "WAUUZO!" }).broadcast();
        }),
      auth: {
        login: authReceiver.message().on(({ header, context }) => {
          console.log("login");
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
  });
});
