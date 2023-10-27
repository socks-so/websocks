import { z } from "zod";
import { createRecursiveProxy } from "./proxy";

import { Adapter } from "./adapter/types";

import {
  AnyHeader,
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
  SocksType,
  TConfig,
} from "./types";

const createReceiverFactory = <THeader, TContext>(
  middlewares: AnyMiddlewareFn<THeader>[]
) => ({
  messages: <TMessages extends SchemaReceiverMessageRecord<THeader>>(
    messages: TMessages
  ) => messages as any as InferReceiverMessageRecord<TMessages>,
  message: () => ({
    on: (handler: ReceiverMessageHandlerFn<THeader, TContext, null>) =>
      ({
        _tag: "receiver",
        middlewares,
        payloadSchema: null,
        handler,
      } as any as SchemaReceiverMessage<THeader, TContext, null>),
    payload: <TPayload>(payloadSchema: z.Schema<TPayload>) => ({
      on: (handler: ReceiverMessageHandlerFn<THeader, TContext, TPayload>) =>
        ({
          _tag: "receiver",
          middlewares,
          payloadSchema,
          handler,
        } as SchemaReceiverMessage<THeader, TContext, TPayload>),
    }),
  }),
  use: <TMiddlewareFn extends MiddlewareFn<THeader, TContext>>(
    middleware: TMiddlewareFn
  ) =>
    createReceiverFactory<
      THeader,
      Prettify<ReturnType<TMiddlewareFn>> //removed advanced merging because typescript error
    >([...middlewares, middleware]),
});

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
        to: (wid: string) => {
          adapter.to(wid, JSON.stringify({ type: pathString, payload }));
        },
        toRoom: (rid: string) => {
          adapter.toRoom(rid, JSON.stringify({ type: pathString, payload }));
        },
        broadcast: () => {
          adapter.broadcast(JSON.stringify({ type: pathString, payload }));
        },
      };
    }, []) as any as InferSenderMessageRecord<TMessages>;
  },
  message: () => ({
    payload: <TPayload>(payloadSchema: z.Schema<TPayload>) =>
      ({
        _tag: "sender",
      } as SchemaSenderMessage<THeader, TPayload>),
  }),
});

function createMessageMap(
  messages: ReceiverMessageRecord<AnyHeader>,
  messageMap = new Map<String, AnyReceiverMessage<AnyHeader>>(),
  prefix = ""
) {
  Object.entries(messages).forEach(([key, value]) => {
    if (value._tag !== "receiver") {
      //if _tag is present, it is a receiver message
      const messageRecord = value as ReceiverMessageRecord<AnyHeader>;
      const newPrefix = `${prefix}${key}.`;
      createMessageMap(messageRecord, messageMap, newPrefix);
    } else {
      //else it is a receiver message record
      const message = value as AnyReceiverMessage<AnyHeader>;
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
      join: (rid: string, wid: string) => {
        config.adapter.join(wid, rid);
      },
      leave: (rid: string, wid: string) => {
        config.adapter.leave(wid, rid);
      },
    },
    receiver: createReceiverFactory<THeader, TContext>(
      config.context ? [config.context] : []
    ),
    sender: createSenderFactory<THeader, TAdapter>(config.adapter),
    create: <
      TReceiverMessages extends ReceiverMessageRecord<THeader>,
      TSenderMessages extends SenderMessageRecord<THeader>
    >(opts: {
      receiverMessages: TReceiverMessages;
      senderMessages: TSenderMessages;
    }) => {
      const messageMap = createMessageMap(opts.receiverMessages);

      return {
        _schema: {} as SocksType<THeader, TReceiverMessages, TSenderMessages>,
        ...(config.adapter.create(messageMap) as ReturnType<
          TAdapter["create"]
        >),
      };
    },
  };
}
