// temporarily for TPayload
type JsonPrimitive = string | number | boolean | null;

type JsonMap = {
  [key: string]: JsonPrimitive | JsonArray | JsonMap;
};

type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>;

export type JsonSerializable = JsonPrimitive | JsonMap | JsonArray;
