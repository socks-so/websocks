import { Adapter } from "../types";
import { SocksServer } from "../../server";

export interface Env {
  WSService: DurableObjectNamespace;
}

export function createSocksAdapter(opts: { token: string }) {
  //worker
  async function fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    const service = env.WSService.get(env.WSService.idFromName(pathname));
    return service.fetch(request);
  }

  const server = new SocksServer(crypto.randomUUID);
  return {
    ...server.toAdapter(),
    create(config, messages) {
      //durable object
      class WSService {
        constructor(
          public state: DurableObjectState,
          public env: Env
        ) {}

        async fetch(request: Request) {
          if (request.headers.get("Upgrade") != "websocket") {
            return new Response(JSON.stringify({ location: request.cf.city }), {
              status: 200,
            });
          }

          let pair = new WebSocketPair();
          let remote = pair[0];
          let ws = pair[1];

          ws.accept();

          // @ts-expect-error
          server.connect(ws, config, messages);

          return new Response(null, {
            status: 101,
            webSocket: remote,
          });
        }
      }
      return {
        WSService,
        fetch,
      };
    },
  } satisfies Adapter;
}
