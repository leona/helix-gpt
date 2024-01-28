import Lsp from "./models/lsp"
import { commands } from "./constants"
import * as handlers from "./events"

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
await lsp.start()
