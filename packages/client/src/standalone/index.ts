import ReconnectingWebSocket from "reconnecting-websocket";
import { createRawClient } from "..";

import { AnySchema } from "../types";

export function createClient<TSocks extends AnySchema>(url: string) {
  const socket = new ReconnectingWebSocket(url);

  return createRawClient<TSocks>(socket);
}
