import { describe, it } from "vitest";

import { init } from "../src/index";

import { createNodeAdapter } from "../src/adapters/node";

import z from "zod";
import { WebSocketServer } from "ws";

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
      context: () => {
        const db = fakeDB.connect();
        const user = null;
        return {
          db,
          user,
        };
      },
      adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
    });

    //since there is no header this is snippet makes no sense
    const authReceiver = s.receiver.use((opts) => {
      const user = opts.context.db.select("no header");
      return { ...opts.context, user };
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
