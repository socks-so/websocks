import { createRawClient } from "..";

import { AnySocksType } from "../types";

export function createClient<TSocks extends AnySocksType>(url: string) {
  const socket = new WebSocket(url);

  return createRawClient<TSocks>(socket);
}
