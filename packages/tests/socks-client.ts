import type { Schema } from "./test";
import { createClient } from "../client/src/node";

const cli = createClient<Schema>("wss://ws.socks.so/discord");

let p1 = performance.now();
let p2 = performance.now();

cli.on.test((payload) => {
  p2 = performance.now();
  console.log("Ping:", p2 - p1);
  console.log("Received Something: ", payload);
});

cli.on.open(() => {
  setInterval(() => {
    p1 = performance.now();
    console.log("Sending Something");
    cli.send.test("Hello from client");
  }, 1000);
});
