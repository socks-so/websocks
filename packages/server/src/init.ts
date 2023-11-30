import { z } from "zod";
import { createRecursiveProxy } from "./proxy";

import { Adapter } from "./adapters/types";

import {
  AnyMiddlewareFn,
  AnyReceiverMessage,
  InferReceiverMessageRecord,
  InferSenderMessageRecord,
  MiddlewareFn,
  Prettify,
  ReceiverMessageHandlerFn,
  ReceiverMessageRecord,
  SchemaReceiverMessage,
  SchemaReceiverMessageRecord,
  SchemaSenderMessage,
  SchemaSenderMessageRecord,
  SenderMessageRecord,
  Schema,
  TConfig,
  Merge,
} from "./types";

// const createReceiverFactory = <THeader, TContext>(
//   middlewares: AnyMiddlewareFn[] = []
// ) => ({
//   messages: <TMessages extends SchemaReceiverMessageRecord>(
//     messages: TMessages
//   ) => messages as any as InferReceiverMessageRecord<TMessages>,
//   message: {
//     payload: <TPayload>(payloadSchema: z.Schema<TPayload>) => ({
//       on: (handler: ReceiverMessageHandlerFn<TContext, TPayload>) =>
//         ({
//           _tag: "receiver",
//           middlewares,
//           payloadSchema,
//           handler,
//         }) as SchemaReceiverMessage<TContext, TPayload>,
//     }),
//     on: (handler: ReceiverMessageHandlerFn<TContext, null>) =>
//       ({
//         _tag: "receiver",
//         middlewares,
//         handler,
//       }) as SchemaReceiverMessage<TContext, null>,
//   },
//   use: <TMiddlewareFn extends MiddlewareFn<TContext>>(
//     middleware: TMiddlewareFn
//   ) =>
//     createReceiverFactory<
//       THeader,
//       Prettify<Merge<TContext, ReturnType<TMiddlewareFn>>>
//     >([...middlewares, middleware]),
// });

class Receiver<THeader, TContext> {
  constructor(private middlewares: AnyMiddlewareFn[] = []) {}

  messages<TMessages extends SchemaReceiverMessageRecord>(messages: TMessages) {
    return messages as any as InferReceiverMessageRecord<TMessages>;
  }

  message = {
    payload: <TPayload>(payloadSchema: z.Schema<TPayload>) => ({
      on: (handler: ReceiverMessageHandlerFn<TContext, TPayload>) =>
        ({
          _tag: "receiver",
          middlewares: this.middlewares,
          payloadSchema,
          handler,
        } as SchemaReceiverMessage<TContext, TPayload>),
    }),
    on: (handler: ReceiverMessageHandlerFn<TContext, null>) =>
      ({
        _tag: "receiver",
        middlewares: this.middlewares,
        handler,
      } as SchemaReceiverMessage<TContext, null>),
  };

  use<TMiddlewareFn extends MiddlewareFn<TContext>>(middleware: TMiddlewareFn) {
    return new Receiver<
      THeader,
      Prettify<Merge<TContext, ReturnType<TMiddlewareFn>>>
    >([...this.middlewares, middleware]);
  }
}

export const createSenderFactory = <THeader, TAdapter extends Adapter>(
  adapter: TAdapter
) => ({
  messages: <TMessages extends SchemaSenderMessageRecord<THeader>>(
    messages: TMessages
  ) => {
    return createRecursiveProxy((opts) => {
      const path = [...opts.path];
      const pathString = path.join(".");
      const [payload] = opts.args;

      return {
        _tag: "sender",
        to: async (wid: string) => {
          await adapter.to(wid, { type: pathString, payload });
        },
        toRoom: async (rid: string) => {
          await adapter.toRoom(rid, { type: pathString, payload });
        },
        broadcast: async () => {
          await adapter.broadcast({ type: pathString, payload });
        },
      };
    }, []) as any as InferSenderMessageRecord<TMessages>;
  },
  message: {
    payload: <TPayload>(payloadSchema: z.Schema<TPayload>) =>
      ({
        _tag: "sender",
      } as SchemaSenderMessage<TPayload>),
  },
});

function createMessageMap(
  messages: ReceiverMessageRecord,
  messageMap = new Map<String, AnyReceiverMessage>(),
  prefix = ""
) {
  Object.entries(messages).forEach(([key, value]) => {
    if (value._tag !== "receiver") {
      //if _tag is present, it is a receiver message
      const messageRecord = value as ReceiverMessageRecord;
      const newPrefix = `${prefix}${key}.`;
      createMessageMap(messageRecord, messageMap, newPrefix);
    } else {
      //else it is a receiver message record
      const message = value as AnyReceiverMessage;
      messageMap.set(`${prefix}${key}`, message);
    }
  });
  return messageMap;
}

export function init<THeader, TContext, TAdapter extends Adapter>(
  config: TConfig<THeader, TContext, TAdapter>
) {
  return {
    rooms: {
      join: config.adapter.join,
      leave: config.adapter.leave,
    },
    receiver: new Receiver<THeader, TContext>([]),
    sender: createSenderFactory<THeader, TAdapter>(config.adapter),
    create: <
      TReceiverMessages extends ReceiverMessageRecord,
      TSenderMessages extends SenderMessageRecord
    >(opts: {
      receiverMessages: TReceiverMessages;
      senderMessages: TSenderMessages;
    }) => {
      const messageMap = createMessageMap(opts.receiverMessages);

      return {
        schema: {} as Schema<TReceiverMessages, TSenderMessages, THeader>,
        ...(config.adapter.create(messageMap) as ReturnType<
          TAdapter["create"]
        >),
      };
    },
  };
}
