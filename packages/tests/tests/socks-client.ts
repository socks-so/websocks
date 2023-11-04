import type { Schema } from "../../cli/test";
import { client } from "../../client/src/node/index";

const cli = client<Schema>("ws://localhost:3000/discord");

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
    cli.send.test("Hello from client");
  }, 1000);
});
