import Lsp from "./lsp"
import { getContent, log, debounce } from "./utils"
import { completion as completionHandler, chat as chatHandler } from "./completions"
import { commands } from "./constants"

const main = async () => {
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

  lsp.on(Lsp.Event.ExecuteCommand, async ({ ctx, request }) => {
    const { command } = request.params
    const { range, query } = request.params.arguments[0]

    ctx.sendDiagnostics([
      {
        message: `Executing ${command}...`,
        range,
        severity: Lsp.DiagnosticSeverity.Information
      }
    ], 10000)

    const content = ctx.getContentFromRange(range)

    try {
      var result = await chatHandler(query, content, ctx.currentUri as string, ctx.language as string)
    } catch (e) {
      log("chat failed", e.message)

      return ctx.sendDiagnostics([{
        message: e.message,
        severity: Lsp.DiagnosticSeverity.Error,
        range
      }], 10000)
    }

    log("received chat result:", result)

    ctx.send({
      method: Lsp.Event.ApplyEdit,
      id: request.id,
      params: {
        label: command,
        edit: {
          changes: {
            [ctx.currentUri as string]: [{
              range,
              newText: result
            }]
          }
        }
      }
    })

    ctx.resetDiagnostics()
  })

  lsp.on(Lsp.Event.CodeAction, ({ ctx, request }) => {
    ctx.currentUri = request.params.textDocument.uri

    ctx.send({
      id: request.id,
      result: commands.map(i => ({
        title: i.label,
        kind: "quickfix",
        diagnostics: [],
        command: {
          title: i.label,
          command: i.key,
          arguments: [{
            range: request.params.range,
            query: i.query
          }]
        }
      }))
    })
  })

  lsp.on(Lsp.Event.Completion, async ({ ctx, request }) => {
    const lastContentVersion = ctx.contentVersion

    debounce("completion", () => {
      completion({ ctx, request, lastContentVersion })
    }, 200)
  })

  const completion = async ({ ctx, request, lastContentVersion }) => {
    const skip = () => {
      ctx.resetDiagnostics()

      ctx.send({
        id: request.id,
        result: {
          isIncomplete: false,
          items: []
        }
      })
    }

    if (ctx.contentVersion > lastContentVersion) {
      log("skipping because content is stale", ctx.contentVersion, ">", lastContentVersion)
      return skip()
    }

    const { lastCharacter, lastLine, templatedContent, contentBefore, contentAfter } = await getContent(ctx.contents, request.params.position.line, request.params.position.character)
    log("calling completion event", ctx.contentVersion, "<", lastContentVersion)

    ctx.sendDiagnostics([
      {
        message: "Fetching completion...",
        severity: Lsp.DiagnosticSeverity.Information,
        range: {
          start: { line: request.params.position.line, character: 0 },
          end: { line: request.params.position.line + 1, character: 0 }
        }
      }
    ], 10000)

    try {
      var hints = await completionHandler({ contentBefore, contentAfter }, ctx.currentUri, ctx.language)
    } catch (e) {
      return ctx.sendDiagnostics([
        {
          message: e.message,
          severity: Lsp.DiagnosticSeverity.Error,
          range: {
            start: { line: request.params.position.line, character: 0 },
            end: { line: request.params.position.line + 1, character: 0 }
          }
        }
      ], 10000)
    }

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

    ctx.resetDiagnostics()
  }

  await lsp.start()
}

try {
  await main()
} catch (e) {
  log("main error", e)
}
