import EventEmitter from "node:events"
import { log } from "../utils"
import type { Buffer, Range, Diagnostic, EventRequest } from "./lsp.types"
import { Event, DiagnosticSeverity } from "./lsp.types"

export class Service {
  emitter: EventEmitter
  capabilities: any
  currentUri?: string
  buffers: Record<string, Buffer>

  constructor({ capabilities }: { capabilities: any }) {
    this.emitter = new EventEmitter({ captureRejections: true })
    this.capabilities = capabilities
    this.buffers = {}
    log("triggerCharacters:", JSON.stringify(capabilities?.completionProvider?.triggerCharacters))
    this.registerDefault()
  }

  registerDefault() {
    this.emitter.on("error", (e) => {
      log("lsp-event-emitter error", e.message)
    })

    this.on(Event.Initialize, async ({ ctx }) => {
      ctx.send({
        id: 0,
        result: {
          capabilities: this.capabilities
        }
      })
    })

    this.on(Event.DidOpen, ({ ctx, request }) => {
      const { uri, text, languageId } = request.params.textDocument

      this.buffers[uri] = {
        uri, text, languageId, version: 0
      }

      this.currentUri = uri
      log("received didOpen", `language: ${languageId}`)
    })

    this.on(Event.Shutdown, () => {
      log("received shutdown request")
      process.exit(0)
    })

    this.on(Event.DidChange, async ({ ctx, request }) => {
      const { uri, version } = request.params.textDocument
      this.buffers[uri] = { ...this.buffers[uri], version, text: request.params.contentChanges[0].text }
      this.currentUri = uri
      log("received didChange", `language: ${this.buffers[uri].languageId}`, `contentVersion: ${version}`, `uri: ${uri}`)
    })
  }

  getContentPadding(text: string): number {
    const lines = text.split("\n")

    const smallestPadding = lines.reduce((acc, line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) return acc;
      const padding = line.match(/^\s+/)?.[0].length || 0;
      return Math.min(padding, acc);
    }, 99999);

    return smallestPadding
  }

  padContent(text: string, padding: number): string {
    return text.split("\n").map((line) => {
      if (line.trim().length === 0) return line
      return " ".repeat(padding) + line
    }).join("\n")
  }

  registerEventHandlers(handlers: Record<string, (lsp: Service) => void>) {
    Object.values(handlers).forEach((i: (lsp: Service) => void) => {
      i(this)
    })
  }

  getContentFromRange(range: Range): string {
    log("getting content from range", JSON.stringify(range), `uri: ${this.currentUri}`, `current buffers: ${JSON.stringify(Object.keys(this.buffers))}`)
    const { start, end } = range
    return this.buffers[this.currentUri]?.text?.split("\n")?.slice(start.line, end.line).join("\n")
  }

  positionalUpdate(uri: string, text: string, range: Range) {
    const buffer = this.buffers[uri]
    const lines = buffer?.text?.split("\n")
    const start = range.start.line
    const end = range.end.line
    const startLine = lines[start]
    const endLine = lines[end]
    const startLineStart = startLine?.substring(0, range.start.character)
    const endLineEnd = endLine?.substring(range.end.character)
    const newLines = [startLineStart + text + endLineEnd]

    const newContents = lines.reduce((acc, line, index) => {
      if (index < start || index > end) {
        acc.push(line)
      } else if (index === start) {
        acc.push(newLines[0])
      }
      return acc
    }, [])

    this.buffers[uri].text = newContents.join("\n")
  }

  on(event: string, callback: (request: EventRequest) => Promise<void> | undefined) {
    this.emitter.on(event, async (request) => {
      try {
        await callback({ ctx: this, request })
      } catch (e) {
        log("error in event", JSON.stringify(request), e.message)
      }
    })
  }

  send({ method, id, result, params }: { method?: Event, id?: number, result?: any, params?: any }) {
    const request = JSON.stringify({
      jsonrpc: "2.0",
      method,
      id,
      result,
      params
    })

    console.log(`Content-Length: ${request.length}\r\n\r\n${request}`)
    log("sent request", request)
  }

  sendDiagnostics(diagnostics: Diagnostic[], timeout: number = 0) {
    log("sending diagnostics", JSON.stringify(diagnostics))

    const params = {
      uri: this.currentUri,
      diagnostics: diagnostics.map((i) => {
        i.source = "helix-gpt"
        return i
      })
    }

    this.send({
      method: Event.PublishDiagnostics,
      params
    })

    if (timeout > 0) {
      setTimeout(() => {
        this.send({
          method: Event.PublishDiagnostics,
          params: {
            uri: this.currentUri,
            diagnostics: []
          }
        })
      }, timeout)
    }
  }

  resetDiagnostics() {
    this.send({
      method: Event.PublishDiagnostics,
      params: {
        uri: this.currentUri,
        diagnostics: []
      }
    })
  }

  parseLine(line: string) {
    const components = line.split('\r\n')

    for (const data of components) {
      try {
        return JSON.parse(data)
      } catch (e) { }
    }

    throw new Error("failed to parse")
  }

  async receiveLine(line: string) {
    try {
      const request = this.parseLine(line)

      if (![Event.DidChange, Event.DidOpen].includes(request.method)) {
        log("received request:", JSON.stringify(request))
      }

      this.emitter.emit(request.method, request)
    } catch (e) {
      log("failed to parse line:", e.message, line)
    }
  }


  async start() {
    for await (const chunk of Bun.stdin.stream()) {
      const chunkText = Buffer.from(chunk).toString();
      this.receiveLine(chunkText)
    }
  }
}

export default {
  Service, Event, DiagnosticSeverity
}
