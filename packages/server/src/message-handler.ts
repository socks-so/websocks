import { Message } from "./message";
import { AnyReceiverMessage } from "./types";

export function handleMessage(
  message: AnyReceiverMessage<any>,
  data: Message,
  wid: string
) {
  const payload = message.payloadSchema?.parse(data.payload);

  const header = {}; //TODO: implement header logic

  const context = handleContext(message, header);

  message.handler({
    wid,
    payload,
    header,
    context,
  });
}

export function handleContext(
  message: AnyReceiverMessage<unknown>,
  header: unknown
) {
  return message.middlewares.reduce(
    (acc, curr) => curr({ header, context: acc }),
    {}
  );
}
