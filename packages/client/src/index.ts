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

export const client = <TSocks extends AnySocksType>() => ({
  send: {} as DecorateReceiverMessageRecord<TSocks["receiverMessages"]>,
  on: {} as DecorateSenderMessageRecord<TSocks["senderMessages"]>,
});
