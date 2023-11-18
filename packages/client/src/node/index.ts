import { WebSocket } from "ws";
import { createRawClient } from "..";

import { AnySocksType, InferHeader } from "../types";

export function createClient<TSocks extends AnySocksType>(
  url: string,
  opts?: { header: InferHeader<TSocks> }
) {
  const socket = new WebSocket(url);

  // @ts-ignore socket is not a websocket
  return createRawClient<TSocks>(socket, opts);
}
