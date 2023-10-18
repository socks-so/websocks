import { describe, it } from "vitest";

import { init, SocksType } from "@websocks/server/src/index";
import { Schema, z } from "zod";

describe("server", () => {
  it("should work", () => {
    const s = init({
      header: z.object({ lol: z.string() }),
      context: () => {
        console.log("first context middleware fn!");
        return {
          user: null,
        };
      },
    });

    const authReceiver = s.receiver.use((opts) => {
      console.log("second auth middleware fn!");
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
          console.log("greet! " + payload.username);
        }),
      auth: {
        login: authReceiver.message().on(({ header, context }) => {
          console.log("login");
          console.log(context.user);
        }),
        logout: authReceiver.message().on(({ header, context }) => {}),
      },
    });

    const server = s.create({
      receiverMessages,
      senderMessages,
    });

    type schema = (typeof server)["_schema"];
  });
});
