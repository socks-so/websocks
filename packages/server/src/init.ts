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
  sender: any;
};

type Receiver<THeader, TContext> = {
  messages: (
    messages: ReceiveMessageRecord<THeader>
  ) => ReceiveMessageRecord<THeader>;
  message: ReceiveMessageFactory<THeader, TContext>;
  use: ReceiverFactory<THeader, TContext>;
};

type ReceiveMessage<THeader, TContext> = {
  /* @internal */
  _payload: z.Schema;
  _header: THeader;
  _context: TContext;
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

type ReceiveMessageRecord<THeader> = Record<
  string,
  ReceiveMessage<THeader, AnyContext>
>;

type ReceiveMessageFactory<THeader, TContext> = () => ReceiveMessageConstruct<
  THeader,
  TContext
>;

type ReceiverFactory<THeader, TContext> = <TNewContext>(
  middleware: (opts: { header: THeader; context: TContext }) => TNewContext
) => Receiver<
  THeader,
  Prettify<
    Omit<TContext, keyof ReplaceUndefined<TNewContext, TContext>> &
      ReplaceUndefined<TNewContext, TContext>
  >
>;

type Sender<THeader, TContext> = {
  messages: any;
  message: any;
  use: any;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type ReplaceUndefined<T, N> = Extract<T, undefined> extends never
  ? T
  : N | Exclude<T, undefined>;

export const init: InitSocksFunction = ({ header, context }) => {
  return {} as any;
};
