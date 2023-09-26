export interface IEngine {
  send: (args: { header: unknown; payload: unknown }) => void;
}

export class DummyEngine implements IEngine {
  send(args: { header: unknown; payload: unknown }) {
    console.log(args);
  }
}

export function say() {
  console.log("Hello");
}
