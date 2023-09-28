import {
  AnyContext,
  AnyHeader,
  AnyPayload,
  ReceiveMessage,
  ReceiverMessageRecord,
  SenderMessage,
  SenderMessageRecord,
  SocksType,
  inferSenderMessagePayload,
} from "@websocks/server";

export type inferHeader<TSocksType> = TSocksType extends SocksType<
  infer THeader,
  ReceiverMessageRecord<AnyHeader>,
  SenderMessageRecord
>
  ? THeader
  : never;

export type inferReceiverMessageRecord<TSocksType> =
  TSocksType extends SocksType<
    AnyHeader,
    infer TReceiverMessageRecord,
    SenderMessageRecord
  >
    ? TReceiverMessageRecord
    : never;

export type inferSenderMessageRecord<TSocksType> = TSocksType extends SocksType<
  AnyHeader,
  ReceiverMessageRecord<AnyHeader>,
  infer TSenderMessageRecord
>
  ? TSenderMessageRecord
  : never;

export type inferReceiverMessagePayload<TReceiverMessage> =
  TReceiverMessage extends ReceiveMessage<AnyHeader, AnyContext, infer TPayload>
    ? TPayload
    : never;

export type DecorateReceiverMessage<
  TReceiverMessage extends ReceiveMessage<AnyHeader, AnyContext, AnyPayload>,
> = (payload: inferReceiverMessagePayload<TReceiverMessage>) => void;

export type DecorateReceiverMessageRecord<
  TReceiverMessageRecord extends ReceiverMessageRecord<AnyHeader>,
> = {
  [K in keyof TReceiverMessageRecord]: TReceiverMessageRecord[K] extends ReceiveMessage<
    AnyHeader,
    AnyContext,
    AnyPayload
  >
    ? DecorateReceiverMessage<TReceiverMessageRecord[K]>
    : TReceiverMessageRecord[K] extends ReceiverMessageRecord<AnyHeader>
    ? DecorateReceiverMessageRecord<TReceiverMessageRecord[K]>
    : never;
};

export type DecorateSenderMessage<
  TSenderMessage extends SenderMessage<AnyPayload>,
> = (
  handler: (input: inferSenderMessagePayload<TSenderMessage>) => void
) => void;

export type DecorateSenderMessageRecord<
  TSenderMessageRecord extends SenderMessageRecord,
> = {
  [K in keyof TSenderMessageRecord]: TSenderMessageRecord[K] extends SenderMessage<AnyPayload>
    ? DecorateSenderMessage<TSenderMessageRecord[K]>
    : TSenderMessageRecord[K] extends SenderMessageRecord
    ? DecorateSenderMessageRecord<TSenderMessageRecord[K]>
    : never;
};

export type SocksClient<
  TSocks extends SocksType<
    AnyHeader,
    ReceiverMessageRecord<AnyHeader>,
    SenderMessageRecord
  >,
> = {
  send: DecorateReceiverMessageRecord<inferReceiverMessageRecord<TSocks>>;
  on: DecorateSenderMessageRecord<inferSenderMessageRecord<TSocks>>;
};
