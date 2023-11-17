import { describe, it, expect } from "vitest";

import { client } from "../src/index";
import { Schema } from "./server";

describe("client", () => {
  it("should work", () => {
    const cli = client<Schema>("ws://localhost:8080");

    cli.on.test((payload) => {
      console.log(payload);
    });
  });
});
