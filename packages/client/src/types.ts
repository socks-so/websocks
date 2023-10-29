import {
  AnyContext,
  AnyHeader,
  AnyPayload,
  ReceiverMessage,
  ReceiverMessageRecord,
  SenderMessage,
  SenderMessageRecord,
  SocksType,
} from "@websocks/server/types";

export type InferReceiverMessagePayload<T> = T extends ReceiverMessage<
  AnyContext,
  infer TPayload
>
  ? TPayload
  : never;

export type DecorateReceiverMessage<
  T extends ReceiverMessage<AnyContext, AnyHeader>
> = (payload: InferReceiverMessagePayload<T>) => void;

export type DecorateReceiverMessageRecord<TRecord> =
  TRecord extends ReceiverMessageRecord
    ? {
        [K in keyof TRecord]: TRecord[K] extends ReceiverMessage<
          AnyContext,
          AnyHeader
        >
          ? DecorateReceiverMessage<TRecord[K]>
          : TRecord[K] extends ReceiverMessageRecord
          ? DecorateReceiverMessageRecord<TRecord[K]>
          : never;
      }
    : never;

export type InferSenderMessagePayload<T> = T extends SenderMessage<
  infer TPayload
>
  ? TPayload
  : never;

export type AnySenderMessage = SenderMessage<AnyPayload>;

export type DecorateSenderMessage<
  TSenderMessage extends SenderMessage<AnyPayload>
> = (
  handler: (args: {
    payload: InferSenderMessagePayload<TSenderMessage>;
  }) => void
) => void;

export type DecorateSenderMessageRecord<TRecord> =
  TRecord extends SenderMessageRecord
    ? {
        [K in keyof TRecord]: TRecord[K] extends SenderMessage<AnyPayload>
          ? DecorateSenderMessage<TRecord[K]>
          : TRecord[K] extends SenderMessageRecord
          ? DecorateSenderMessageRecord<TRecord[K]>
          : never;
      } & {
        open: (handler: () => void) => void; //temporary for utility events
        close: (handler: () => void) => void;
      }
    : never;
