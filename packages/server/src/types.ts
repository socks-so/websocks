// temporarily for TPayload
type JsonPrimitive = string | number | boolean | null;

type JsonMap = {
  [key: string]: JsonPrimitive | JsonArray | JsonMap;
};

type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>;

export type JsonSerializable = JsonPrimitive | JsonMap | JsonArray;

import { z } from "zod";
import { Adapter } from "./adapter/types";

export type AnyHeader = any;
export type AnyContext = any;
export type AnyPayload = any;

export type AnyAdapter = Adapter;

export type TConfig<
  THeader extends AnyHeader, //header temporarily removed until I figure out what to do with it
  TContext extends AnyContext,
  TAdapter extends Adapter
> = {
  context?: ContextFn<TContext>;
  adapter: TAdapter;
};

export type AnyConfig = TConfig<AnyHeader, AnyContext, AnyAdapter>;

export type ConnectFn<THeader, TContext> = (opts: {
  header: THeader;
}) => TContext;

export type ContextFn<TContext> = () => TContext;

export type SchemaReceiverMessageRecord = {
  [key: string]:
    | SchemaReceiverMessage<AnyContext, AnyPayload>
    | SchemaReceiverMessageRecord;
};

export type InferSchemaReceiverMessageRecord<T> =
  T extends ReceiverMessageRecord
    ? {
        [K in keyof T]: T[K] extends ReceiverMessage<AnyContext, AnyPayload>
          ? InferSchemaReceiverMessage<T[K]>
          : T[K] extends ReceiverMessageRecord
          ? InferSchemaReceiverMessageRecord<T[K]>
          : never;
      }
    : never;

export type InferReceiverMessageRecord<T> =
  T extends SchemaReceiverMessageRecord
    ? {
        [K in keyof T]: T[K] extends SchemaReceiverMessage<
          AnyContext,
          AnyPayload
        >
          ? InferReceiverMessage<T[K]>
          : T[K] extends SchemaReceiverMessageRecord
          ? InferReceiverMessageRecord<T[K]>
          : never;
      }
    : never;

export type ReceiverMessageRecord = {
  [key: string]: AnyReceiverMessage | ReceiverMessageRecord;
};

export type SchemaSenderMessageRecord<THeader> = {
  [key: string]:
    | SchemaSenderMessage<AnyPayload>
    | SchemaSenderMessageRecord<THeader>;
};

export type InferSchemaSenderMessageRecord<T> = T extends SenderMessageRecord
  ? {
      [K in keyof T]: T[K] extends SenderMessage<AnyPayload>
        ? InferSchemaSenderMessage<T[K]>
        : T[K] extends SenderMessageRecord
        ? InferSchemaSenderMessageRecord<T[K]>
        : never;
    }
  : never;

export type InferSenderMessageRecord<T> = T extends SchemaSenderMessageRecord<
  infer THeader
>
  ? {
      [K in keyof T]: T[K] extends SchemaSenderMessage<AnyPayload>
        ? InferSenderMessage<T[K]>
        : T[K] extends SchemaSenderMessageRecord<THeader>
        ? InferSenderMessageRecord<T[K]>
        : never;
    }
  : never;

export type SenderMessageRecord = {
  [key: string]: AnySenderMessage | SenderMessageRecord;
};

export type SchemaSenderMessage<TPayload> = { _tag: "sender" };

export type InferSchemaSenderMessage<T> = T extends SenderMessage<
  infer TPayload
>
  ? SchemaSenderMessage<TPayload>
  : never;

export type InferSenderMessage<T> = T extends SchemaSenderMessage<
  infer TPayload
>
  ? SenderMessage<TPayload>
  : never;

export type SenderMessage<TPayload> = (payload: TPayload) => {
  _tag: "sender";
  to: (wid: string) => void;
  toRoom: (rid: string) => void;
  broadcast: () => void;
};

export type AnySenderMessage = SenderMessage<AnyPayload>;

export type SchemaReceiverMessage<TContext, TPayload> = {
  _tag: "receiver";
};

export type AnySchemaReceiverMessage = SchemaReceiverMessage<
  AnyContext,
  AnyPayload
>;

export type InferSchemaReceiverMessage<T> = T extends ReceiverMessage<
  infer TContext,
  infer TPayload
>
  ? SchemaReceiverMessage<TContext, TPayload>
  : never;

export type InferReceiverMessage<T> = T extends SchemaReceiverMessage<
  infer TContext,
  infer TPayload
>
  ? ReceiverMessage<TContext, TPayload>
  : never;

export type MiddlewareFn<TContext> = (opts: { context: TContext }) => any;

export type AnyMiddlewareFn = MiddlewareFn<AnyContext>;

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

export type ReceiverMessageHandlerFn<TContext, TPayload> = (opts: {
  wid: string;
  payload: TPayload;
  context: TContext;
}) => any;

export type ReceiverMessage<TContext, TPayload> = {
  _tag: "receiver";
  middlewares: AnyMiddlewareFn[];
  payloadSchema: z.Schema<TPayload> | null;
  handler: ReceiverMessageHandlerFn<TContext, TPayload>;
};

export type AnyReceiverMessage = ReceiverMessage<AnyContext, AnyPayload>;

export type SocksType<
  TReceiverMessages extends ReceiverMessageRecord,
  TSenderMessgages extends SenderMessageRecord
> = {
  receiverMessages: TReceiverMessages;
  senderMessages: TSenderMessgages;
};
