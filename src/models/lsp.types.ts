import EventEmitter from "node:events"

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

export interface IService {
  emitter: EventEmitter
  currentUri?: string
  capabilities: any
  buffers: Record<string, Buffer>
  sendDiagnostics(diagnostics: Diagnostic[], timeout?: number): void;
  resetDiagnostics(): void;
  receiveLine(line: string): Promise<void>;
  start(): Promise<void>;
  send({ method, id, result, params }: { method?: Event, id?: number, result?: any, params?: any }): void;
  getContentFromRange({ range }: { range: Range }): string;
  on(event: Event, callback: (request: EventRequest) => void): void;
}

export type EventRequest = {
  ctx: IService,
  request: any
}

export type Buffer = {
  text: string,
  version: number,
  languageId: string,
  uri: string,
}

