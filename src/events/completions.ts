import Lsp from "../models/lsp"
import type { IService } from "../models/lsp.types"
import { debounce, log, getContent } from "../utils"
import { completion as completionHandler } from "../models/completions"

export const completions = (lsp: IService) => {
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

    const { lastLine, contentBefore, contentAfter } = await getContent(ctx.contents, request.params.position.line, request.params.position.character)
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
}
