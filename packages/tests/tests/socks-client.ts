import type { Schema } from "../../cli/test";
import { client } from "../../client/src/node/index";

const cli = client<Schema>("wss://d3ofqvewhlynrt.cloudfront.net/discord");

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

// ws.on("open", () => {
//   setInterval(() => {
//     p1 = performance.now();
//     ws.send(JSON.stringify({ type: "test", data: "Hello from client" }));
//   }, 1000);
// });

// ws.on("message", (data) => {
//   p2 = performance.now();
//   console.log("Ping:", p2 - p1);
//   console.log("Received Something: ", data);
// });
