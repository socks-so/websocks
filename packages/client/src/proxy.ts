export interface ProxyCallbackOptions {
  path: string[];
  args: unknown[];
}

export type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;

export function createRecursiveProxy(callback: ProxyCallback, path: string[]) {
  const proxy: unknown = new Proxy(() => {}, {
    get(_obj, key) {
      if (typeof key !== "string") return undefined;

      return createRecursiveProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args,
      });
    },
  });

  return proxy;
}
