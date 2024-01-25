import EventEmitter from "node:events"
import { log } from "./utils"

enum Event {
  DidOpen = "textDocument/didOpen",
  DidChange = "textDocument/didChange",
  Completion = "textDocument/completion",
  Initialize = "initialize",
  Shutdown = "shutdown",
  Exit = "exit",
  PublishDiagnostics = "textDocument/publishDiagnostics",
}

enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

type Position = {
  start: number,
  end: number
}

type Range = {
  start: Position,
  end: Position
}

type Diagnostic = {
  message: string,
  range: Range,
  source?: string,
  severity?: DiagnosticSeverity
}

interface IService {
  currentUri?: string
  contents?: string
  language?: string,
  contentVersion?: number
  capabilities: any
  sendDiagnostics(diagnostics: Diagnostic[], timeout?: number): void;
  resetDiagnostics(): void;
  receiveLine(line: string): Promise<void>;
  start(): Promise<void>;
  send({ method, id, result, params }: { method?: Event, id?: number, result?: any, params?: any }): void;
}

type EventRequest = {
  ctx: IService,
  request: any
}

class Service {
  emitter: EventEmitter
  capabilities: any
  currentUri?: string
  contentVersion: number
  language?: string
  contents?: string

  constructor({ capabilities }) {
    this.emitter = new EventEmitter()
    this.capabilities = capabilities
    this.contentVersion = 0
    this.registerDefault()
  }

  registerDefault() {
    this.on(Event.Initialize, async ({ ctx }) => {
      ctx.send({
        method: Event.Initialize,
        id: 0,
        result: {
          capabilities: this.capabilities
        }
      })
    })

    this.on(Event.DidOpen, ({ ctx, request }) => {
      ctx.currentUri = request.params.textDocument.uri
    })

    this.on(Event.Shutdown, ({ ctx, request }) => {
      log("received shutdown request")
      process.exit(0)
    })

    this.on(Event.DidOpen, async ({ ctx, request }) => {
      ctx.contents = request.params.textDocument.text
      ctx.language = request.params.textDocument.languageId
      ctx.contentVersion = 0
    })

    this.on(Event.DidChange, async ({ ctx, request }) => {
      ctx.contents = request.params.contentChanges[0].text
      ctx.contentVersion = request.params.textDocument.version
    })
  }

  on(event: string, callback: (request: EventRequest) => void) {
    const parent = this

    this.emitter.on(event, async (request) => {
      try {
        callback({ ctx: parent, request })
      } catch (e) {
        log("error in event", JSON.stringify(request), e.message)
      }
    })
  }

  send({ method, id, result, params }: { method?: Event, id?: number, result?: any, params?: any }) {
    if (result === null) return

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

  sendDiagnostics(diagnostics: Diagnostic[], timeout?: number = 0) {
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

  async receiveLine(line: string) {
    try {
      const request = JSON.parse(line.split('\r\n')[2])

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
