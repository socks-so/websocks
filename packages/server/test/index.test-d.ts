import { describe, it, expect, assertType } from "vitest";
import { init } from "../src/index";
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

    const sender = s.sender.messages({
      greet: s.sender
        .message()
        .payload(z.object({ greetingMessage: z.string() })),
      deep: {
        greet: s.sender
          .message()
          .payload(z.object({ greetingMessage: z.string() })),
      },
    });

    const receives = s.receiver.messages({
      hello: s.receiver
        .message()
        .payload(z.object({ name: z.string() }))
        .on(({ input, context }) => {
          context.db.insert(input.name);
          console.log(input.name);
          sender
            .greet({ greetingMessage: `greetings ${input.name}` })
            .to(input.name);
        }),

      helloUser: authReceiver.message().on(({ context }) => {
        context.db.insert(context.user.username);
        console.log(context.user.username);
        sender
          .greet({ greetingMessage: `greetings ${context.user.username}` })
          .to(context.user.username);
      }),

      deep: {
        greet: s.receiver
          .message()
          .payload(z.object({ msg: z.string() }))
          .on(({ input, context }) => {
            sender.deep.greet({ greetingMessage: input.msg }).to("test");
          }),
      },
    });
  });
});
