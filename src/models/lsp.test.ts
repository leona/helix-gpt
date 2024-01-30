import { expect, test } from "bun:test";
import Lsp from "./lsp"

test("parseLine", async () => {
  const lsp = new Lsp.Service({})

  const content1 = `Content-Length: 154\r\n{"id": 1}\r\nContent-Length: 200\n`
  expect(lsp.parseLine(content1)).toEqual({ id: 1 })

  const content2 = `Content-Length: 1766\r\n{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{"general":{"positionEncodings":["utf-8","utf-32","utf-16"]},"textDocument":{"codeAction":{"codeActionLiteralSupport":{"codeActionKind":{"valueSet":["","quickfix","refactor","refactor.extract","refactor.inline","refactor.rewrite","source","source.organizeImports"]}},"dataSupport":true,"disabledSupport":true,"isPreferredSupport":true,"resolveSupport":{"properties":["edit","command"]}},"completion":{"completionItem":{"deprecatedSupport":true,"insertReplaceSupport":true,"resolveSupport":{"properties":["documentation","detail","additionalTextEdits"]},"snippetSupport":true,"tagSupport":{"valueSet":[1]}},"completionItemKind":{}},"hover":{"contentFormat":["markdown"]},"inlayHint":{"dynamicRegistration":false},"publishDiagnostics":{"versionSupport":true},"rename":{"dynamicRegistration":false,"honorsChangeAnnotations":false,"prepareSupport":true},"signatureHelp":{"signatureInformation":{"activeParameterSupport":true,"documentationFormat":["markdown"],"parameterInformation":{"labelOffsetSupport":true}}}},"window":{"workDoneProgress":true},"workspace":{"applyEdit":true,"configuration":true,"didChangeConfiguration":{"dynamicRegistration":false},"didChangeWatchedFiles":{"dynamicRegistration":true,"relativePatternSupport":false},"executeCommand":{"dynamicRegistration":false},"inlayHint":{"refreshSupport":false},"symbol":{"dynamicRegistration":false},"workspaceEdit":{"documentChanges":true,"failureHandling":"abort","normalizesLineEndings":false,"resourceOperations":["create","rename","delete"]},"workspaceFolders":true}},"clientInfo":{"name":"helix","version":"23.10"},"processId":4557,"rootPath":"/app","rootUri":"file:///app","workspaceFolders":[{"name":"app","uri":"file:///app"}]},"id":0}`
  expect(lsp.parseLine(content2)).toMatchObject({ method: "initialize" })

  const content3 = `{"id": 1}\r\nContent-Length: 200\n`
  expect(lsp.parseLine(content3)).toEqual({ id: 1 })

  const content4 = `  registerEventHandlers(handlers: Record<string, (lsp: IService) => void>) {
    Object.values(handlers).forEach((i: (lsp: IService) => void) => {
      i(this)
    })
  }
`
  const padding = lsp.getContentPadding(content4)
  expect(padding).toEqual(2)

  const content5 = `const example = 1`
  const padding2 = lsp.getContentPadding(content5)
  expect(padding2).toEqual(0)
})
