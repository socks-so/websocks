import { AnyReceiverMessage } from "../types";

export interface AdapterArgs {
  message?: (wid: string, data: unknown) => void;
  open?: (wid: string) => void;
  close?: (wid: string) => void;
  drain?: (wid: string) => void;
}

export interface Adapter {
  to: (wid: string, data: any) => void;
  toRoom: (rid: string, data: any) => void;
  broadcast: (data: any) => Promise<void>;

  join: (wid: string, rid: string) => void;
  leave: (wid: string, rid: string) => void;

  create: <TMessageMap extends Map<String, AnyReceiverMessage>>(
    messageMap: TMessageMap
  ) => any;
}
