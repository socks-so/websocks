import { Adapter } from "../types";

import { handleMessage } from "../../message-handler";
import { Message } from "../../message";

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

  const createService = () => {
    const clientToWid = new Map<WebSocket, string>();
    const widToClient = new Map<string, WebSocket>();

    const rooms = new Map<string, Set<string>>();
    const widInRooms = new Map<string, Set<string>>();

    return {
      connect(server: WebSocket) {
        const wid = crypto.randomUUID();
        clientToWid.set(server, wid);
        widToClient.set(wid, server);
        widInRooms.set(wid, new Set());
        return wid;
      },

      async to(wid, data) {
        widToClient.get(wid)?.send(JSON.stringify(data));
      },

      async toRoom(rid, data) {
        for (const wid of rooms.get(rid) || []) {
          widToClient.get(wid)?.send(JSON.stringify(data));
        }
      },

      async broadcast(data) {
        for (const ws of clientToWid.keys()) {
          ws.send(JSON.stringify(data));
        }
      },

      async join(wid, rid) {
        if (!rooms.has(rid)) {
          rooms.set(rid, new Set());
        }
        rooms.get(rid)?.add(wid);

        if (!widInRooms.has(wid)) {
          widInRooms.set(wid, new Set());
        }
        widInRooms.get(wid)?.add(rid);
      },

      async leave(wid, rid) {
        rooms.get(rid)?.delete(wid);
        widInRooms.get(wid)?.delete(rid);
      },
    };
  };

  const service = createService();

  return {
    ...service,

    create(messageMap) {
      class WSService {
        constructor(private state: DurableObjectState, private env: Env) {}

        async fetch(request: Request) {
          if (request.headers.get("Upgrade") != "websocket") {
            return new Response(JSON.stringify({ location: request.cf.city }), {
              status: 200,
            });
          }

          let pair = new WebSocketPair();
          let client = pair[0];
          let server = pair[1];

          server.accept();

          const wid = service.connect(server);

          server.addEventListener("message", (event) => {
            try {
              const parsedData = parseRawData(event.data);
              const message = messageMap.get(parsedData.type);

              if (!message) {
                return server.send(
                  JSON.stringify({
                    type: "error",
                    payload: "message not found",
                  })
                );
              }

              handleMessage(message, parsedData, wid);
            } catch (err) {
              if (err instanceof Error) {
                console.log(err);
                server.send(
                  JSON.stringify({ type: "error", payload: err.message })
                );
              }
            }
          });

          return new Response(null, {
            status: 101,
            webSocket: client,
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

function parseRawData(data: any) {
  return JSON.parse(data.toString()) as Message;
}
