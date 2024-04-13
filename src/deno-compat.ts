import { Buffer } from "node:buffer"

export function runningInDeno(): boolean {
  //@ts-ignore ok
  return Boolean(globalThis.Deno)
}

function injectDenoComapt() {
  //@ts-ignore ok
  globalThis.Bun = new Bun()
  globalThis.Buffer = Buffer
}

class Bun {
  argv: string[];
  env: Record<string, string>;
  stdin: { stream: () => any; };

  constructor() {
    this.argv = globalThis.Deno.args;
    this.env = new Proxy({}, {
      get: (_target, property: string) => {
        return globalThis.Deno.env.get(property);
      },
    });
    this.stdin = {
      stream: () => Deno.stdin.readable
    }
  }
}

if (runningInDeno()) injectDenoComapt()
