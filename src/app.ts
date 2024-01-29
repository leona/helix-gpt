import Lsp from "./models/lsp"
import { commands } from "./constants"
import * as handlers from "./events"
import { log } from "./utils"
import assistant from "./models/assistant"
import Github from "./providers/github"
import Openai from "./providers/openai"

assistant.registerProvider("copilot", new Github())
assistant.registerProvider("openai", new Openai())

const lsp = new Lsp.Service({
  capabilities: {
    codeActionProvider: true,
    executeCommandProvider: {
      commands: commands.map(i => i.key)
    },
    completionProvider: {
      resolveProvider: false,
      triggerCharacters: ["{", "(", " ", "."]
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
