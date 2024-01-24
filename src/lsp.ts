import EventEmitter from "node:events"
import { log } from "./utils"

enum Event {
  DidOpen = "textDocument/didOpen",
  DidChange = "textDocument/didChange",
  Completion = "textDocument/completion",
  Initialize = "initialize",
  Shutdown = "shutdown",
  Exit = "exit",
}

class Service {
  emitter: EventEmitter
  capabilities: any

  constructor({ capabilities }) {
    this.emitter = new EventEmitter()
    this.capabilities = capabilities
    this.registerInit()
  }

  registerInit() {
    this.on(Event.Initialize, async ({ ctx }) => {
      ctx.send({
        method: Event.Initialize,
        id: 0,
        result: {
          capabilities: this.capabilities
        }
      })
    })
  }

  on(event: string, callback: (any)) {
    const parent = this

    this.emitter.on(event, async (request) => {
      try {
        await callback({ ctx: parent, request })
      } catch (e) {
        log("error in event", JSON.stringify(request), e.message)
      }
    })
  }

  send({ method, id, result, params }: { method: Event, id: number, result: any, params: any }) {
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
  Service, Event
}
