import { z } from "zod";

export type AnyHeader = any;
export type AnyContext = any;
export type AnyPayload = any;

export type InitSocksFunction = <
  THeader extends AnyHeader,
  TContext extends AnyContext,
>(config: {
  header: z.Schema<THeader>;
  context: (opts: { header: THeader }) => TContext;
}) => {
  receiver: Receiver<THeader, TContext>;
  sender: Sender;
  create: Create<THeader>;
};

export type inferSenderMessageRecord<T> = T extends DecorateSenderMessageRecord<
  infer SenderMessageRecord
>
  ? SenderMessageRecord
  : never;

export type Create<THeader> = <
  TDecorateSenderMessageRecord extends
    DecorateSenderMessageRecord<SenderMessageRecord>,
  TReceiverMessageRecord extends ReceiverMessageRecord<THeader>,
>(socks: {
  sender: TDecorateSenderMessageRecord;
  receiver: TReceiverMessageRecord;
}) => SocksType<
  THeader,
  TReceiverMessageRecord,
  inferSenderMessageRecord<TDecorateSenderMessageRecord>
>;

export type SocksType<
  THeader,
  TReceiverMessageRecord extends ReceiverMessageRecord<THeader>,
  TSenderMessageRecord extends SenderMessageRecord,
> = {
  receives: TReceiverMessageRecord;
  sends: TSenderMessageRecord;
};

export type Receiver<THeader, TContext> = {
  messages: <TReceiverMessageRecord extends ReceiverMessageRecord<THeader>>(
    messages: TReceiverMessageRecord
  ) => TReceiverMessageRecord;
  message: ReceiveMessageFactory<THeader, TContext>;
  use: ReceiverFactory<THeader, TContext>;
};

export type Sender = {
  messages: <TSenderMessageRecord extends SenderMessageRecord>(
    messages: TSenderMessageRecord
  ) => DecorateSenderMessageRecord<TSenderMessageRecord>;
  message: SendeMesageFactory;
};

export type ReceiveMessage<THeader, TContext, TPayload> = {
  /* @internal */
  _payloadSchema: z.Schema;
  _payload: TPayload;
  _header: THeader;
  _context: TContext;
};

export type SenderMessage<TPayload> = {
  /* @internal */
  _payload: TPayload;
  _senderMessage: true;
};

export type inferSenderMessagePayload<T> = T extends SenderMessage<
  infer TPayload
>
  ? TPayload
  : never;

export type DecorateSenderMessage<
  TSenderMessage extends SenderMessage<AnyPayload>,
> = (payload: inferSenderMessagePayload<TSenderMessage>) => {
  to: (wid: string) => void;
  toRoom: (rid: string) => void;
  broadcast: () => void;
};

export type DecorateSenderMessageRecord<T extends SenderMessageRecord> = {
  [K in keyof T]: T[K] extends SenderMessage<AnyPayload>
    ? DecorateSenderMessage<T[K]>
    : T[K] extends SenderMessageRecord
    ? DecorateSenderMessageRecord<T[K]>
    : never;
};

export type ReceiveMessageConstructWithPayload<THeader, TContext, TPayload> = {
  on: (
    handler: (opts: {
      input: TPayload;
      header: THeader;
      context: TContext;
    }) => void
  ) => ReceiveMessage<THeader, TContext, TPayload>;
};

export type ReceiveMessageConstruct<THeader, TContext> = {
  on: (
    handler: (opts: { header: THeader; context: TContext }) => void
  ) => ReceiveMessage<THeader, TContext, never>;
  payload: <TPayload>(
    schema: z.Schema<TPayload>
  ) => ReceiveMessageConstructWithPayload<THeader, TContext, TPayload>;
};

export type SenderMessageConstruct = {
  payload: <TPayload>(schema: z.Schema<TPayload>) => SenderMessage<TPayload>;
};

export type ReceiverMessageRecord<THeader> = {
  [key: string]:
    | ReceiverMessageRecord<THeader>
    | ReceiveMessage<THeader, AnyContext, AnyPayload>;
};

export type SenderMessageRecord = {
  [key: string]: SenderMessageRecord | SenderMessage<AnyPayload>;
};

export type ReceiveMessageFactory<THeader, TContext> =
  () => ReceiveMessageConstruct<THeader, TContext>;

export type SendeMesageFactory = () => SenderMessageConstruct;

export type ReceiverFactory<THeader, TContext> = <TNewContext>(
  middleware: (opts: { header: THeader; context: TContext }) => TNewContext
) => Receiver<
  THeader,
  Prettify<
    Omit<TContext, keyof ReplaceUndefined<TNewContext, TContext>> &
      ReplaceUndefined<TNewContext, TContext>
  >
>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ReplaceUndefined<T, N> = Extract<T, undefined> extends never
  ? T
  : N | Exclude<T, undefined>;

export const init: InitSocksFunction = ({ header, context }) => {
  return {} as any;
};
