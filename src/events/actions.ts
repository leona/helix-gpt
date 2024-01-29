import Lsp from "../models/lsp"
import type { IService } from "../models/lsp.types"
import { commands } from "../constants"
import assistant from "../models/assistant"
import { log } from "../utils"

export const actions = (lsp: IService) => {
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
    const buffer = ctx.buffers[ctx.currentUri]

    try {
      var result = await assistant.chat(query, content, ctx.currentUri as string, buffer?.languageId as string)

      if (!result?.length) {
        throw new Error("No completion found")
      }
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
}
