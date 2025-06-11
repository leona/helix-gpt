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

    this.on(Event.Initialize, async ({ ctx, request }) => {
      ctx.send({
        id: request.id,
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

    const len = (new TextEncoder()).encode(request).length
    process.stdout.write(`Content-Length: ${len}\r\n\r\n${request}`)
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

  async emitRequest(request: Object) {
    if (![Event.DidChange, Event.DidOpen].includes(request.method)) {
      log("received request:", JSON.stringify(request))
    }
    this.emitter.emit(request.method, request)
  }

  async start() {
    const parser = new Parser();
    for await (const chunk of Bun.stdin.stream()) {
      const chunkText = Buffer.from(chunk).toString();
      parser.addChunkToBuffer(chunkText);
      let parsed;
      while((parsed = parser.parseBuffer())) {
        this.emitRequest(parsed)
      }
    }
  }
}

class Parser {
  private buffer: Array;
  private contentLength;
  private contentLengthRegex = /content-length:\ *(?<cl>\d+)\r\n\r\n/i
  private encoder: TextEncoder;
  private decoder: TextDecoder;
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.buffer = [];
    this.contentLength = -1;
    return this;
  }

  private parseContentLength() {
      let capture = this.getBuffer().match(this.contentLengthRegex)
      if (capture === null) {
        throw new Error(`no Content-Length header in buffer: \"${this.getBuffer()}\"`)
      };
      let contentLengthStr = capture.groups?.cl;
      
      try {
        let contentLength = parseInt(contentLengthStr)
        this.consumeBytesFromBuffer(capture[0].length + capture.index);
        return contentLength;
      }
      catch (e) {
        log("failed to parse content length header", e.message, `raw buffer: ${this.buffer}`)
        throw new Error(`Invalid Content-Length header. Expected Integer value, got: ${contentLengthStr}`)
      }
  }

  private parseRPC() {
    let rpc = this.consumeBytesFromBuffer(this.contentLength);
    return JSON.parse(rpc)
  }

  addChunkToBuffer(chunk: string) {
    this.buffer.push(chunk)
  }

  getBuffer() {
    return this.buffer.join('')
  }

  private consumeBytesFromBuffer(bytes: number) {
    let newBuffer = this.encoder.encode(this.getBuffer()).slice(bytes);
    let consumed = this.encoder.encode(this.getBuffer()).slice(0, bytes);
    this.buffer = Array.of(this.decoder.decode(newBuffer));
    return this.decoder.decode(consumed);
  }
  getCurrentBufferSize() {
    return this.encoder.encode(this.getBuffer()).length
  }
  parseBuffer() {
    let parsed = null;
    try {
      if (this.contentLength === -1) {
        this.contentLength = this.parseContentLength();
      }
      if (this.contentLength !== -1 && this.contentLength > 0) {
        let encodedBuffer = this.encoder.encode(this.getBuffer())
        if (encodedBuffer.length >= this.contentLength) {
          parsed = this.parseRPC()
          this.contentLength = -1;
        }
      }
    }
    catch(e) {
     log("failed to parse buffer", e.message, this.buffer)
    }
    return parsed;
  }
}

export default {
  Service, Event, DiagnosticSeverity
}
