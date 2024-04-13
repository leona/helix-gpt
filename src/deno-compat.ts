import { Buffer } from "node:buffer"

const Deno = (globalThis as any).Deno

export function runningInDeno(): boolean {
  return Boolean(Deno)
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
    this.argv = Deno.args;
    this.env = new Proxy({}, {
      get: (_target, property: string) => {
        return Deno.env.get(property);
      },
    });
    this.stdin = {
      stream: () => Deno.stdin.readable
    }
  }
}

if (runningInDeno()) injectDenoComapt()
