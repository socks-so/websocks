import { Message } from "./message";
import { AnyConfig, AnyReceiverMessage } from "./types";

export async function handleConnect<TConfig extends AnyConfig>(
  config: TConfig,
  data: Message
) {
  const header = config.header?.parse(data.payload);

  let context = {};

  if (config.connect) context = await config.connect(header);

  return context;
}

export async function handleMessage(
  message: AnyReceiverMessage,
  data: Message,
  wid: string,
  initContext: any
) {
  const payload = message.payloadSchema?.parse(data.payload);

  const context = handleContext(message, initContext);

  await message.handler({
    wid,
    payload,
    context,
  });
}

export function handleContext(message: AnyReceiverMessage, initContext: any) {
  return message.middlewares.reduce(
    (acc, curr) => ({ ...curr({ context: acc }), ...acc }),
    initContext
  );
}
