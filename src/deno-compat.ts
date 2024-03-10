import { parseArgs as nodeParseArgs } from "node:util"
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

// deno parseArgs node compat doesn't support default option currently
// so we use a custom one for now
// https://github.com/denoland/deno/issues/22454
export function parseArgs(inputObject) {
  const { args, options } = inputObject;

  // Remove default fields from options
  const optionsWithoutDefaults = {};
  for (const key in options) {
    optionsWithoutDefaults[key] = { ...options[key] };
    delete optionsWithoutDefaults[key].default;
  }

  // Run node.parseArgs() on options without default fields
  const p = nodeParseArgs({ args, options: optionsWithoutDefaults });

  // Fill missing values in p.options with defaults
  const filledOptions = {};
  for (const key in options) {
    if (!p.values[key]) {
      filledOptions[key] = options[key].default;
      p.values[key] = options[key].default
    }
  }

  // Update p object with filled options
  p.options = filledOptions;

  return p;
}



if (runningInDeno()) injectDenoComapt()


