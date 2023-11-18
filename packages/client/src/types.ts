import {
  AnyContext,
  AnyHeader,
  AnyPayload,
  ReceiverMessage,
  ReceiverMessageRecord,
  SenderMessage,
  SenderMessageRecord,
  SocksType,
} from "../../server/src/types";

export type AnySocksType = SocksType<
  ReceiverMessageRecord,
  SenderMessageRecord
>;

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
  handler: (args: { payload: InferSenderMessagePayload<TSenderMessage> }) => any
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
        open: (handler: () => any) => void; //temporary for utility events
        close: (handler: () => any) => void;
      }
    : never;

export type Client<TSocks extends AnySocksType> = {
  send: DecorateReceiverMessageRecord<TSocks["receiverMessages"]>;
  on: DecorateSenderMessageRecord<TSocks["senderMessages"]>;
};
