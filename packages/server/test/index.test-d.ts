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

    const f = init({
      header: z.object({ tok: z.string() }),
      context: ({ header }) => {
        const db = fakeDB.connect();
        const user = null;
        return {
          db,
          user,
        };
      },
    });

    // TESTING SECTIION
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

    const receives = s.receiver.messages({
      hello: s.receiver
        .message()
        .payload(z.object({ name: z.string() }))
        .on(({ input, context }) => {
          context.db.insert(input.name);
          console.log(input.name);
        }),

      helloUser: authReceiver.message().on(({ context }) => {
        context.db.insert(context.user.username);
        console.log(context.user.username);
      }),
      //@ts-expect-error
      sholdNotWork: f.receiver.message().on(({ context }) => {}),
    });
  });
});
