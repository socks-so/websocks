import { z } from "zod";

type AnyHeader = any;
type AnyContext = any;
type AnyPayload = any;

type InitSocksFunction = <
  THeader extends AnyHeader,
  TContext extends AnyContext,
>(config: {
  header: z.Schema<THeader>;
  context: (opts: { header: THeader }) => TContext;
}) => {
  receiver: Receiver<THeader, TContext>;
  sender: Sender;
};

type Receiver<THeader, TContext> = {
  messages: (
    messages: ReceiveMessageRecord<THeader>
  ) => ReceiveMessageRecord<THeader>;
  message: ReceiveMessageFactory<THeader, TContext>;
  use: ReceiverFactory<THeader, TContext>;
};

type Sender = {
  messages: <TSenderMessageRecord extends SenderMessageRecord>(
    messages: TSenderMessageRecord
  ) => DecorateSenderMessages<TSenderMessageRecord>;
  message: SendeMesageFactory;
};

type ReceiveMessage<THeader, TContext> = {
  /* @internal */
  _payload: z.Schema;
  _header: THeader;
  _context: TContext;
};

type SenderMessage<TPayload> = {
  /* @internal */
  _payload: TPayload;
  _senderMessage: true;
};

type inferSenderMessagePayload<T> = T extends SenderMessage<infer TPayload>
  ? TPayload
  : never;

type DecoratedSenderMessage<TSenderMessage extends SenderMessage<AnyPayload>> =
  (payload: inferSenderMessagePayload<TSenderMessage>) => {
    to: (wid: string) => void;
    toRoom: (rid: string) => void;
    broadcast: () => void;
  };

type DecorateSenderMessages<T extends SenderMessageRecord> = {
  [K in keyof T]: T[K] extends SenderMessage<AnyPayload>
    ? DecoratedSenderMessage<T[K]>
    : T[K] extends SenderMessageRecord
    ? DecorateSenderMessages<T[K]>
    : never;
};

type ReceiveMessageConstructWithPayload<THeader, TContext, TPayload> = {
  on: (
    handler: (opts: {
      input: TPayload;
      header: THeader;
      context: TContext;
    }) => void
  ) => ReceiveMessage<THeader, TContext>;
};

type ReceiveMessageConstruct<THeader, TContext> = {
  on: (
    handler: (opts: { header: THeader; context: TContext }) => void
  ) => ReceiveMessage<THeader, TContext>;
  payload: <TPayload>(
    schema: z.Schema<TPayload>
  ) => ReceiveMessageConstructWithPayload<THeader, TContext, TPayload>;
};

type SenderMessageConstruct = {
  payload: <TPayload>(schema: z.Schema<TPayload>) => SenderMessage<TPayload>;
};

type ReceiveMessageRecord<THeader> = {
  [key: string]: ReceiveMessageRecord<THeader> | ReceiveMessage<THeader, any>;
};

type SenderMessageRecord = {
  [key: string]: SenderMessageRecord | SenderMessage<AnyPayload>;
};

type ReceiveMessageFactory<THeader, TContext> = () => ReceiveMessageConstruct<
  THeader,
  TContext
>;

type SendeMesageFactory = () => SenderMessageConstruct;

type ReceiverFactory<THeader, TContext> = <TNewContext>(
  middleware: (opts: { header: THeader; context: TContext }) => TNewContext
) => Receiver<
  THeader,
  Prettify<
    Omit<TContext, keyof ReplaceUndefined<TNewContext, TContext>> &
      ReplaceUndefined<TNewContext, TContext>
  >
>;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type ReplaceUndefined<T, N> = Extract<T, undefined> extends never
  ? T
  : N | Exclude<T, undefined>;

export const init: InitSocksFunction = ({ header, context }) => {
  return {} as any;
};
