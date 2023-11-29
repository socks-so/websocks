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
      adapter: createNodeAdapter(new WebSocketServer({ port: 8080 })),
      header: z.object({ token: z.string().optional() }),
      connect: ({ token }) => {
        return token === "admin"
          ? { user: null, db: fakeDB.connect(), isAdmin: true }
          : { user: null, db: fakeDB.connect(), isAdmin: false };
      },
    });

    //since there is no header this is snippet makes no sense
    const authReceiver = s.receiver.use(() => ({
      user: { username: "Rahul" } as const,
    }));

    const sends = s.sender.messages({
      greet: s.sender.message.payload(
        z.object({ greetingMessage: z.string() })
      ),
      deep: {
        greet: s.sender.message.payload(z.object({ msg: z.string() })),
      },
    });

    const receives = s.receiver.messages({
      hello: s.receiver.message
        .payload(z.object({ name: z.string() }))
        .on(({ payload }) => {
          console.log(payload.name);
          sends
            .greet({ greetingMessage: `greetings ${payload.name}` })
            .to(payload.name);
        }),

      helloUser: authReceiver.message.on(({ context }) => {
        console.log(context.user.username);
        sends
          .greet({ greetingMessage: `greetings ${context.user.username}` })
          .to(context.user.username);
      }),

      deep: {
        greet: s.receiver.message
          .payload(z.object({ msg: z.string() }))
          .on(({ payload }) => {
            sends.deep.greet({ msg: payload.msg }).to("test");
          }),
      },
    });

    const socks = s.create({
      receiverMessages: receives,
      senderMessages: sends,
    });
  });
});
