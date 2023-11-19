import { createRawClient } from "..";

import { AnySchema, InferHeader } from "../types";

export function createClient<TSocks extends AnySchema>(
  url: string,
  opts?: { header: InferHeader<TSocks> }
) {
  const socket = new WebSocket(url);

  return createRawClient<TSocks>(socket, opts);
}
