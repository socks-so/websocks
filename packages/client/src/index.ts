import mitt from "mitt";

import { createRecursiveProxy } from "./proxy";

import { AnySocksType, Client, InferHeader } from "./types";

export const createRawClient = <TSocks extends AnySocksType>(
  socket: WebSocket,
  opts?: { header: InferHeader<TSocks> }
) => {
  const emitter = mitt();

  socket.onopen = () => {
    console.log("connected to websocket server");
    emitter.emit("open");

    //should send connection messages with headers first but still TODO
  };

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data.toString());
    emitter.emit(type, payload);
  };

  socket.onclose = () => {
    console.log("disconnected from websocket server");
    emitter.emit("close");
  };

  socket.onerror = (error) => {
    console.error(error);
    emitter.emit("error", error);
  };

  return createRecursiveProxy(async (opts) => {
    const path = [...opts.path];
    const method = path.shift()! as "send" | "on";
    const pathString = path.join(".");
    const [input] = opts.args;

    if (method === "send") {
      const payload = input;
      console.log("sending", { type: pathString, payload });
      socket.send(JSON.stringify({ type: pathString, payload }));
    }

    if (method === "on") {
      const handler = input as (payload: unknown) => void;
      emitter.on(pathString, handler);
    }
  }, []) as Client<TSocks>;
};
