import Lsp from "./lsp"
import { getContent, log } from "./utils"
import { getHints } from "./openai"

const main = async () => {
  let contents: string = ""
  let language: string
  let completionTimeout: NodeJS.Timeout
  let contentVersion = 0
  const triggerCharacters = ["{", "(", ")", "=", ">", " ", ",", ":"]

  const lsp = new Lsp.Service({
    capabilities: {
      completionProvider: {
        resolveProvider: false,
        triggerCharacters
      },
      textDocumentSync: {
        change: 1,
      }
    },
  })

  lsp.on(Lsp.Event.Shutdown, ({ ctx, request }) => {
    log("received shutdown request")
    process.exit(0)
  })

  lsp.on(Lsp.Event.DidOpen, async ({ request }) => {
    contents = request.params.textDocument.text
    language = request.params.textDocument.languageId
  })

  lsp.on(Lsp.Event.DidChange, async ({ request }) => {
    contents = request.params.contentChanges[0].text
    contentVersion = request.params.textDocument.version
  })

  lsp.on(Lsp.Event.Completion, async ({ ctx, request }) => {
    if (completionTimeout) {
      clearTimeout(completionTimeout)
    }

    const lastContentVersion = contentVersion
    log("processing completion event", lastContentVersion)

    completionTimeout = setTimeout(() => {
      completion({ ctx, request, lastContentVersion })
    }, 200)
  })

  const completion = async ({ ctx, request, lastContentVersion }) => {
    const skip = () => {
      ctx.send({
        id: request.id,
        result: {
          isIncomplete: false,
          items: []
        }
      })
    }

    if (contentVersion > lastContentVersion) {
      log("skipping because content is stale", contentVersion, ">", lastContentVersion)
      skip()
      return
    }

    log("calling completion event", contentVersion, "<", lastContentVersion)
    const { lastCharacter, lastLine, templatedContent } = await getContent(contents, request.params.position.line, request.params.position.character)

    if (!triggerCharacters.includes(lastCharacter)) {
      log("skipping", lastCharacter, "not in", triggerCharacters)
      skip()
      return
    }

    const hints = await getHints(templatedContent, language)

    log("sending completion", JSON.stringify({
      templatedContent, hints
    }))

    const items = hints?.map((i) => {
      if (i.startsWith(lastLine.trim())) {
        i = i.slice(lastLine.trim().length)
      }

      const lines = i.split('\n')
      const cleanLine = request.params.position.line + lines.length - 1
      let cleanCharacter = lines.slice(-1)[0].length

      if (cleanLine == request.params.position.line) {
        cleanCharacter += request.params.position.character
      }

      return {
        label: i.split('\n')[0],
        kind: 1,
        preselect: true,
        detail: i,
        insertText: i,
        insertTextFormat: 1,
        additionalTextEdits: [
          {
            newText: "",
            range: {
              start: { line: cleanLine, character: cleanCharacter },
              end: { line: cleanLine, character: 200 }
            }
          }
        ]
      }
    })

    ctx.send({
      id: request.id,
      result: {
        isIncomplete: true,
        items
      }
    })
  }

  await lsp.start()
}

try {
  await main()
} catch (e) {
  log("ERROR", e)
}
