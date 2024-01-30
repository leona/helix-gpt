import EventEmitter from "node:events"
import { Service } from "./lsp"

export enum Event {
  DidOpen = "textDocument/didOpen",
  DidChange = "textDocument/didChange",
  Completion = "textDocument/completion",
  CodeAction = "textDocument/codeAction",
  ApplyEdit = "workspace/applyEdit",
  ExecuteCommand = "workspace/executeCommand",
  Initialize = "initialize",
  Shutdown = "shutdown",
  Exit = "exit",
  PublishDiagnostics = "textDocument/publishDiagnostics",
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export type Position = {
  line: number,
  character: number
}

export type Range = {
  start: Position,
  end: Position
}

export type Diagnostic = {
  message: string,
  range: Range,
  source?: string,
  severity?: DiagnosticSeverity
}

export type EventRequest = {
  ctx: Service
  request: any,
}

export type Buffer = {
  text: string,
  version: number,
  languageId: string,
  uri: string,
}

