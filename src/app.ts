import Lsp from "./models/lsp"
import { commands } from "./constants"
import * as handlers from "./events"
import { log } from "./utils"

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
      change: 2,
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
