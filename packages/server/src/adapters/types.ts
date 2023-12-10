import { AnyConfig, AnyReceiverMessage, TConfig } from "../types";

export interface Adapter {
  to: (wid: string, data: any) => void;
  toRoom: (rid: string, data: any) => void;
  broadcast: (data: any) => void;

  join: (wid: string, rid: string) => void;
  leave: (wid: string, rid: string) => void;

  create: <
    TMessageMap extends Map<String, AnyReceiverMessage>,
    TConf extends AnyConfig
  >(
    config: TConf,
    messageMap: TMessageMap
  ) => any;
}
