import { z } from "zod";

export type AnyHeader = any;
export type AnyContext = any;
export type AnyPayload = any;

export type TConfig<THeader, TContext> = {
  header: z.Schema<THeader>;
  context: (opts: { header: THeader }) => TContext;
};

export type AnyConfig = TConfig<AnyHeader, AnyContext>;

export type SchemaReceiverMessageRecord<THeader> = {
  [key: string]:
    | SchemaReceiverMessage<THeader, AnyContext, AnyPayload>
    | SchemaReceiverMessageRecord<THeader>;
};

export type InferSchemaReceiverMessageRecord<T> =
  T extends ReceiverMessageRecord<infer THeader>
    ? {
        [K in keyof T]: T[K] extends ReceiverMessage<
          AnyHeader,
          AnyContext,
          AnyPayload
        >
          ? InferSchemaReceiverMessage<T[K]>
          : T[K] extends ReceiverMessageRecord<THeader>
          ? InferSchemaReceiverMessageRecord<T[K]>
          : never;
      }
    : never;

export type InferReceiverMessageRecord<T> =
  T extends SchemaReceiverMessageRecord<infer THeader>
    ? {
        [K in keyof T]: T[K] extends SchemaReceiverMessage<
          AnyHeader,
          AnyContext,
          AnyPayload
        >
          ? InferReceiverMessage<T[K]>
          : T[K] extends SchemaReceiverMessageRecord<THeader>
          ? InferReceiverMessageRecord<T[K]>
          : never;
      }
    : never;

export type ReceiverMessageRecord<THeader> = {
  [key: string]: AnyReceiverMessage<THeader> | ReceiverMessageRecord<THeader>;
};

export type SchemaSenderMessageRecord<THeader> = {
  [key: string]:
    | SchemaSenderMessage<THeader, AnyPayload>
    | SchemaSenderMessageRecord<THeader>;
};

export type InferSchemaSenderMessageRecord<T> = T extends SenderMessageRecord<
  infer THeader
>
  ? {
      [K in keyof T]: T[K] extends SenderMessage<infer THeader, infer TPayload>
        ? InferSchemaSenderMessage<T[K]>
        : T[K] extends SenderMessageRecord<THeader>
        ? InferSchemaSenderMessageRecord<T[K]>
        : never;
    }
  : never;

export type InferSenderMessageRecord<T> = T extends SchemaSenderMessageRecord<
  infer THeader
>
  ? {
      [K in keyof T]: T[K] extends SchemaSenderMessage<AnyHeader, AnyPayload>
        ? InferSenderMessage<T[K]>
        : T[K] extends SchemaSenderMessageRecord<THeader>
        ? InferSenderMessageRecord<T[K]>
        : never;
    }
  : never;

export type SenderMessageRecord<THeader> = {
  [key: string]: AnySenderMessage<THeader> | SenderMessageRecord<THeader>;
};

export type SchemaSenderMessage<THeader, TPayload> = { _tag: "sender" };

export type InferSchemaSenderMessage<T> = T extends SenderMessage<
  infer THeader,
  infer TPayload
>
  ? SchemaSenderMessage<THeader, TPayload>
  : never;

export type InferSenderMessage<T> = T extends SchemaSenderMessage<
  infer THeader,
  infer TPayload
>
  ? SenderMessage<THeader, TPayload>
  : never;

export type SenderMessage<THeader, TPayload> = (payload: TPayload) => {
  to: (wid: string) => void;
  toRoom: (rid: string) => void;
  broadcast: () => void;
};

export type AnySenderMessage<THeader> = SenderMessage<THeader, AnyPayload>;

export type SchemaReceiverMessage<THeader, TContext, TPayload> = {
  _tag: "receiver";
  _payload: TPayload;
};

export type AnySchemaReceiverMessage<THeader> = SchemaReceiverMessage<
  THeader,
  AnyContext,
  AnyPayload
>;

export type InferSchemaReceiverMessage<T> = T extends ReceiverMessage<
  infer THeader,
  infer TContext,
  infer TPayload
>
  ? SchemaReceiverMessage<THeader, TContext, TPayload>
  : never;

export type InferReceiverMessage<T> = T extends SchemaReceiverMessage<
  infer THeader,
  infer TContext,
  infer TPayload
>
  ? ReceiverMessage<THeader, TContext, TPayload>
  : never;

export type MiddlewareFn<THeader, TContext> = (opts: {
  header: THeader;
  context: TContext;
}) => any;

export type AnyMiddlewareFn<THeader> = MiddlewareFn<THeader, AnyContext>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Merge<Object1, Object2> = Omit<Object1, keyof Object2> & Object2;

/* unused because of typescript erros
export type ReplaceUndefined<T, N> = Extract<T, undefined> extends never
  ? T
  : N | Exclude<T, undefined>;

export type NewContext<TContext, TNewContext> = Prettify<
  TContext & TNewContext
>;
*/

export type ReceiverMessageHandlerFn<THeader, TContext, TPayload> = (opts: {
  payload: TPayload;
  header: THeader;
  context: TContext;
}) => any;

export type ReceiverMessage<THeader, TContext, TPayload> = {
  middlewares: AnyMiddlewareFn<THeader>[];
  payloadSchema: z.Schema<TPayload> | null;
  handler: ReceiverMessageHandlerFn<THeader, TContext, TPayload>;
};

export type AnyReceiverMessage<THeader> = ReceiverMessage<
  THeader,
  AnyContext,
  AnyPayload
>;

const createReceiverFactory = <THeader, TContext>(
  middlewares: AnyMiddlewareFn<THeader>[]
) => ({
  messages: <TMessages extends SchemaReceiverMessageRecord<THeader>>(
    messages: TMessages
  ) => messages as any as InferReceiverMessageRecord<TMessages>,
  message: () => ({
    on: (handler: ReceiverMessageHandlerFn<THeader, TContext, null>) =>
      ({
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
          _payload: {} as TPayload,
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

export const createSenderFactory = <THeader>() => ({
  messages: <TMessages extends SchemaSenderMessageRecord<THeader>>(
    messages: TMessages
  ) => {
    return messages as any as InferSenderMessageRecord<TMessages>;
  },
  message: () => ({
    payload: <TPayload>(payloadSchema: z.Schema<TPayload>) =>
      ({
        _tag: "sender",
      } as SchemaSenderMessage<THeader, TPayload>),
  }),
});

export type SocksType<
  THeader,
  TReceiverMessages extends ReceiverMessageRecord<THeader>,
  TSenderMessgages extends SenderMessageRecord<THeader>
> = {
  receiverMessages: TReceiverMessages;
  senderMessages: TSenderMessgages;
};

export const init = <THeader, TContext>(
  config: TConfig<THeader, TContext>
) => ({
  receiver: createReceiverFactory<THeader, TContext>([config.context]),
  sender: createSenderFactory<THeader>(),
  create: <
    TReceiverMessages extends ReceiverMessageRecord<THeader>,
    TSenderMessages extends SenderMessageRecord<THeader>
  >(opts: {
    receiverMessages: TReceiverMessages;
    senderMessages: TSenderMessages;
  }) => {
    return {
      _schema: {} as SocksType<THeader, TReceiverMessages, TSenderMessages>,
    };
  },
});
