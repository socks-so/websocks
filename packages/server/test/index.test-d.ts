import { describe, it, expect, assertType } from "vitest";

import { init } from "@websocks/server/src/index";
import z from "zod";

describe("server types", () => {
  it("no type errors", () => {
    //fake db
    const fakeDB = {
      connect: () => ({
        select: (id: string) => ({ username: "test" }),
        insert: (id: string) => ({ username: "test" }),
      }),
    };

    const s = init({
      header: z.object({ token: z.string().optional() }),
      context: ({ header }) => {
        const db = fakeDB.connect();
        const user = null;
        return {
          db,
          user,
        };
      },
    });

    const authReceiver = s.receiver.use((opts) => {
      if (!opts.header.token) {
        throw new Error("No token");
      }
      const user = opts.context.db.select(opts.header.token);
      return { user };
    });

    const sends = s.sender.messages({
      greet: s.sender
        .message()
        .payload(z.object({ greetingMessage: z.string() })),
      deep: {
        greet: s.sender.message().payload(z.object({ msg: z.string() })),
      },
    });

    const receives = s.receiver.messages({
      hello: s.receiver
        .message()
        .payload(z.object({ name: z.string() }))
        .on(({ payload, context }) => {
          context.db.insert(payload.name);
          console.log(payload.name);
          sends
            .greet({ greetingMessage: `greetings ${payload.name}` })
            .to(payload.name);
        }),

      helloUser: authReceiver.message().on(({ context }) => {
        context.db.insert(context.user.username);
        console.log(context.user.username);
        sends
          .greet({ greetingMessage: `greetings ${context.user.username}` })
          .to(context.user.username);
      }),

      deep: {
        greet: s.receiver
          .message()
          .payload(z.object({ msg: z.string() }))
          .on(({ payload, context }) => {
            sends.deep.greet({ msg: payload.msg }).to("test");
          }),
      },
    });

    const socks = s.create({
      receiverMessages: receives,
      senderMessages: sends,
    });
    type SocksType = typeof socks;
  });
});
