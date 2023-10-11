export interface Adapter {
  to: (wid: string, data: any) => void;
  toRoom: (rid: string, data: any) => void;
  broadcast: (data: any) => void;
  open: (fn: (wid: string) => void) => void;
  message: (fn: (wid: string, data: any) => void) => void;
  close: (fn: (wid: string) => void) => void;
  drain: (fn: () => void) => void;

  join: (wid: string, rid: string) => void;
  leave: (wid: string, rid: string) => void;
}
