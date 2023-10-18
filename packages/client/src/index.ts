import {
  AnyContext,
  AnyHeader,
  AnyPayload,
  ReceiverMessage,
  ReceiverMessageRecord,
  SenderMessage,
  SenderMessageRecord,
  SocksType,
} from "@websocks/server";

import mitt from "mitt";

export type AnySocksType = SocksType<
  AnyHeader,
  ReceiverMessageRecord<AnyHeader>,
  SenderMessageRecord<AnyHeader>
>;

export type InferReceiverMessagePayload<T> = T extends ReceiverMessage<
  AnyHeader,
  AnyContext,
  infer TPayload
>
  ? TPayload
  : never;

export type DecorateReceiverMessage<
  T extends ReceiverMessage<AnyHeader, AnyContext, AnyHeader>
> = (payload: InferReceiverMessagePayload<T>) => void;

export type DecorateReceiverMessageRecord<TRecord> =
  TRecord extends ReceiverMessageRecord<AnyHeader>
    ? {
        [K in keyof TRecord]: TRecord[K] extends ReceiverMessage<
          AnyHeader,
          AnyContext,
          AnyHeader
        >
          ? DecorateReceiverMessage<TRecord[K]>
          : TRecord[K] extends ReceiverMessageRecord<AnyHeader>
          ? DecorateReceiverMessageRecord<TRecord[K]>
          : never;
      }
    : never;

export type InferSenderMessagePayload<T> = T extends SenderMessage<
  AnyHeader,
  infer TPayload
>
  ? TPayload
  : never;

export type InferSenderMessageHeader<T> = T extends SenderMessage<
  infer THeader,
  AnyPayload
>
  ? THeader
  : never;

export type AnySenderMessage = SenderMessage<AnyHeader, AnyPayload>;

export type DecorateSenderMessage<
  TSenderMessage extends SenderMessage<AnyHeader, AnyPayload>
> = (
  handler: (args: {
    header: InferSenderMessageHeader<TSenderMessage>;
    payload: InferSenderMessagePayload<TSenderMessage>;
  }) => void
) => void;

export type DecorateSenderMessageRecord<TRecord> =
  TRecord extends SenderMessageRecord<AnyHeader>
    ? {
        [K in keyof TRecord]: TRecord[K] extends SenderMessage<
          AnyHeader,
          AnyPayload
        >
          ? DecorateSenderMessage<TRecord[K]>
          : TRecord[K] extends SenderMessageRecord<AnyHeader>
          ? DecorateSenderMessageRecord<TRecord[K]>
          : never;
      }
    : never;

export const client = <TSocks extends AnySocksType>() => {
  const emitter = mitt();
  const socket = new WebSocket("ws://localhost:8080");

  return createRecursiveProxy(async (opts) => {
    const path = [...opts.path];
    const method = path.shift()! as "send" | "on";
    const pathString = path.join(".");

    const [input] = opts.args;

    if (method === "send") {
      const payload = input;
      emitter.emit(pathString, payload);
    }

    if (method === "on") {
      const handler = input as (payload: unknown) => void;
      emitter.on(pathString, handler);
    }
  }, []) as {
    send: DecorateReceiverMessageRecord<TSocks["receiverMessages"]>;
    on: DecorateSenderMessageRecord<TSocks["senderMessages"]>;
  };
};

interface ProxyCallbackOptions {
  path: string[];
  args: unknown[];
}

type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;

function createRecursiveProxy(callback: ProxyCallback, path: string[]) {
  const proxy: unknown = new Proxy(() => {}, {
    get(_obj, key) {
      if (typeof key !== "string") return undefined;

      return createRecursiveProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args,
      });
    },
  });

  return proxy;
}
