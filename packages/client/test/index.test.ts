import { describe, it, expect } from "vitest";

import { client } from "../src/index";
import { Schema } from "./server";
import { SocksProvider, useWebsocks } from "../src/react/index";

describe("client", () => {
  it("should work", () => {
    const cli = client<Schema>("ws://localhost:8080");
    const t = useWebsocks<Schema>();

    cli.on.test((payload) => {
      console.log(payload);
    });
  });
});
