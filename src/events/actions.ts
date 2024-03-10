import { Service } from "../models/lsp.ts";
import { DiagnosticSeverity, Event } from "../models/lsp.types.ts";
import { commands } from "../constants.ts";
import assistant from "../models/assistant.ts";
import { log } from "../utils.ts";

export const actions = (lsp: Service) => {
  lsp.on(Event.ExecuteCommand, async ({ ctx, request }) => {
    const { command } = request.params
    const { diagnostics, range } = request.params.arguments[0]
    let { query } = request.params.arguments[0]

    ctx.sendDiagnostics([
      {
        message: `Executing ${command}...`,
        range,
        severity: DiagnosticSeverity.Information
      }
    ], 10000)

    const content = ctx.getContentFromRange(range)
    const padding = ctx.getContentPadding(content)
    const buffer = ctx.buffers[ctx.currentUri]
    log("chat request content:", content)

    if (diagnostics?.length) {
      query += "\n\nDiagnostics: " + diagnostics.join("\n- ")
    }

    try {
      var { result } = await assistant.chat(query, content, ctx.currentUri as string, buffer?.languageId as string)

      if (!result?.length) {
        throw new Error("No completion found")
      }
    } catch (e) {
      log("chat failed", e.message)

      return ctx.sendDiagnostics([{
        message: e.message,
        severity: DiagnosticSeverity.Error,
        range
      }], 10000)
    }

    result = ctx.padContent(result.trim(), padding) + "\n"
    log("received chat result:", result)

    ctx.send({
      method: Event.ApplyEdit,
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

  lsp.on(Event.CodeAction, ({ ctx, request }) => {
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
            query: i.query,
            diagnostics: request.params.context?.diagnostics?.map(i => i.message)
          }]
        }
      }))
    })
  })
}
