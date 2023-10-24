import { createRecursiveProxy } from "./proxy";

import mitt from "mitt";

import {
  AnySocksType,
  DecorateReceiverMessageRecord,
  DecorateSenderMessageRecord,
} from "./types";

export const client = <TSocks extends AnySocksType>(url: string) => {
  const socket = new WebSocket(url);
  const emitter = mitt();

  socket.onopen = () => {
    console.log("connected to websocket server");
    emitter.emit("open");
  };

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
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
  }, []) as {
    send: DecorateReceiverMessageRecord<TSocks["receiverMessages"]>;
    on: DecorateSenderMessageRecord<TSocks["senderMessages"]>;
  };
};
