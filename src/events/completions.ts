import { Service } from "../models/lsp";
import { Event, DiagnosticSeverity } from "../models/lsp.types";
import { debounce, log, getContent } from "../utils";
import assistant from "../models/assistant";
import config from "../config";

export const completions = (lsp: Service) => {
  lsp.on(Event.Completion, async ({ ctx, request }) => {
    const buffer = ctx.buffers[request.params.textDocument.uri];
    const lastContentVersion = buffer.version;
    const { lastCharacter } = await getContent(
      buffer.text,
      request.params.position.line,
      request.params.position.character,
    );

    if (lastCharacter == ".") {
      return ctx.send({
        id: request.id,
        result: {
          isIncomplete: false,
          items: [],
        },
      });
    }

    debounce(
      "completion",
      async () => {
        try {
          await completion({ ctx, request, lastContentVersion });
        } catch (e) {
          log("error in completion event", e.message);
          ctx.sendDiagnostics(
            [
              {
                message: e.message,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: { line: request.params.position.line, character: 0 },
                  end: { line: request.params.position.line + 1, character: 0 },
                },
              },
            ],
            config.completionTimeout,
          );
        }
      },
      config.debounce,
    );
  });

  const completion = async ({ ctx, request, lastContentVersion }) => {
    const skip = () => {
      ctx.resetDiagnostics();

      ctx.send({
        id: request.id,
        result: {
          isIncomplete: false,
          items: [],
        },
      });
    };

    const buffer = ctx.buffers[request.params.textDocument.uri];
    log("running completion on buffer", JSON.stringify(buffer));

    if (buffer.version > lastContentVersion) {
      log("skipping because content is stale");
      return skip();
    }

    const { lastLine, contentBefore, contentAfter, contentImmediatelyAfter } =
      await getContent(
        buffer.text,
        request.params.position.line,
        request.params.position.character,
      );
    log("calling completion event");

    ctx.sendDiagnostics(
      [
        {
          message: "Fetching completion...",
          severity: DiagnosticSeverity.Information,
          range: {
            start: { line: request.params.position.line, character: 0 },
            end: { line: request.params.position.line + 1, character: 0 },
          },
        },
      ],
      config.completionTimeout,
    );

    try {
      var hints = await assistant.completion(
        { contentBefore, contentAfter },
        ctx.currentUri,
        buffer?.languageId,
      );
    } catch (e) {
      return ctx.sendDiagnostics(
        [
          {
            message: e.message,
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: request.params.position.line, character: 0 },
              end: { line: request.params.position.line + 1, character: 0 },
            },
          },
        ],
        config.completionTimeout,
      );
    }

    log("completion hints:", hints);

    const items = hints?.map((i: string) => {
      i = i.trim();
      if (i.startsWith(lastLine.trim())) {
        i = i.slice(lastLine.trim().length).trim();
      }

      const lines = i.split("\n");
      const cleanLine = request.params.position.line + lines.length - 1;
      let cleanCharacter = lines.slice(-1)[0].length;

      if (cleanLine == request.params.position.line) {
        cleanCharacter += request.params.position.character;
      }

      return {
        label: lines[0].length > 20 ? lines[0] : i.slice(0, 20).trim(),
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
              end: {
                line: cleanLine,
                character: cleanCharacter + contentImmediatelyAfter?.length,
              },
            },
          },
        ],
      };
    });

    ctx.send({
      id: request.id,
      result: {
        isIncomplete: false,
        items,
      },
    });

    ctx.resetDiagnostics();
  };
};
