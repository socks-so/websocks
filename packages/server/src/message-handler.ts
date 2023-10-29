import { Message } from "./message";
import { AnyReceiverMessage } from "./types";

export function handleMessage(
  message: AnyReceiverMessage,
  data: Message,
  wid: string
) {
  const payload = message.payloadSchema?.parse(data.payload);

  const context = handleContext(message);

  message.handler({
    wid,
    payload,
    context,
  });
}

export function handleContext(message: AnyReceiverMessage) {
  return message.middlewares.reduce((acc, curr) => curr({ context: acc }), {});
}
