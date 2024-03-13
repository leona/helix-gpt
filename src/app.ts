import Lsp from "./models/lsp"
import { commands } from "./constants"
import * as handlers from "./events"
import { log } from "./utils"
import config from "./config"
import assistant from "./models/assistant"
import copilotAuth from "./models/copilot-auth"
import codeiumAuth from "./models/codeium-auth"
import Github from "./providers/github"
import Openai from "./providers/openai"
import Codeium from "./providers/codeium"
import Ollama from "./providers/ollama"

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
assistant.registerProvider("ollama", new Ollama())

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
