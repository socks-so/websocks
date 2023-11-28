import { createRawClient } from "..";

import { AnySchema } from "../types";

export function createClient<TSocks extends AnySchema>(url: string) {
  const socket = new WebSocket(url);

  return createRawClient<TSocks>(socket);
}
