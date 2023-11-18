import WebSocket from "ws";

import { createRawClient } from "..";

import { AnySocksType } from "../types";

export function createClient<TSocks extends AnySocksType>(url: string) {
  const socket = new WebSocket(url);

  // @ts-ignore
  return createRawClient<TSocks>(socket);
}
