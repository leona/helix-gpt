import "./deno-compat.ts";
import Lsp from "./models/lsp.ts";
import { commands } from "./constants.ts";
import * as handlers from "./events/index.ts";
import { log } from "./utils.ts";
import config from "./config.ts";
import assistant from "./models/assistant.ts";
import copilotAuth from "./models/copilot-auth.ts";
import codeiumAuth from "./models/codeium-auth.ts";
import Github from "./providers/github.ts";
import Openai from "./providers/openai.ts";
import Codeium from "./providers/codeium.ts";
import process from "node:process";


if (config.authCopilot) {
  await copilotAuth()
  process.exit(0)
}

if (config.authCodeium) {
  await codeiumAuth()
  process.exit(0)
}

assistant.registerProvider("copilot", new Github())
assistant.registerProvider("openai", new Openai())
assistant.registerProvider("codeium", new Codeium())

const lsp = new Lsp.Service({
  capabilities: {
    codeActionProvider: true,
    executeCommandProvider: {
      commands: commands.map(i => i.key)
    },
    completionProvider: {
      resolveProvider: false,
      triggerCharacters: config.triggerCharacters
    },
    textDocumentSync: {
      change: 1,
      openClose: true
    }
  }
})

lsp.registerEventHandlers(handlers)

try {
  await lsp.start()
} catch (e) {
  log("lsp-service error", e.message)
}
