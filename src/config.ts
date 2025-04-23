import { parseArgs } from "util";
import { context } from "./constants";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    numSuggestions: {
      type: "string",
      default: "2",
    },
   suggestions: {
      type: "string",
      default: "0",
    },
    logFile: {
      type: "string",
      default: Bun.env.LOG_FILE ?? "",
    },
    handler: {
      type: "string",
      default: Bun.env.HANDLER ?? "openai",
    },
    debounce: {
      type: "string",
      default: Bun.env.DEBOUNCE ?? "200",
    },
    triggerCharacters: {
      type: "string",
      default: Bun.env.TRIGGER_CHARACTERS ?? "{||(|| ",
    },
    openaiKey: {
      type: "string",
      default: Bun.env.OPENAI_API_KEY,
    },
    openaiContext: {
      type: "string",
      default: Bun.env.OPENAI_CONTEXT?.length
        ? Bun.env.OPENAI_CONTEXT
        : context.openai,
    },
    openaiModel: {
      type: "string",
      default: Bun.env.OPENAI_MODEL ?? "gpt-3.5-turbo-16k",
    },
    openaiMaxTokens: {
      type: "string",
      default: Bun.env.OPENAI_MAX_TOKENS ?? "7000",
    },
    openaiEndpoint: {
      type: "string",
      default: Bun.env.OPENAI_ENDPOINT ?? "https://api.openai.com/v1",
    },
    copilotEndpoint: {
      type: "string",
      default: Bun.env.GITHUB_ENDPOINT ?? "https://api.githubcopilot.com",
    },
    copilotContext: {
      type: "string",
      default: Bun.env.COPILOT_CONTEXT?.length
        ? Bun.env.COPILOT_CONTEXT
        : context.copilot,
    },
    copilotModel: {
      type: "string",
      default: Bun.env.COPILOT_MODEL ?? "gpt-3.5-turbo",
    },
    copilotApiKey: {
      type: "string",
      default: Bun.env.COPILOT_API_KEY,
    },
    authCopilot: {
      type: "boolean",
      default: false,
    },
    authCodeium: {
      type: "boolean",
      default: false,
    },
    codeiumApiKey: {
      type: "string",
      default:
        Bun.env.CODEIUM_API_KEY ?? "d49954eb-cfba-4992-980f-d8fb37f0e942", // Public Codeium key
    },
    fetchTimeout: {
      type: "string",
      default: Bun.env.FETCH_TIMEOUT ?? "10000",
    },
    actionTimeout: {
      type: "string",
      default: Bun.env.ACTION_TIMEOUT ?? "10000",
    },
    completionTimeout: {
      type: "string",
      default: Bun.env.COMPLETION_TIMEOUT ?? "10000",
    },
    ollamaEndpoint: {
      type: "string",
      // use 127.0.0.1 instead of localhost for issue with bun
      // see: https://github.com/oven-sh/bun/issues/1425
      default: Bun.env.OLLAMA_ENDPOINT ?? "http://127.0.0.1:11434",
    },
    ollamaModel: {
      type: "string",
      default: Bun.env.OLLAMA_MODEL ?? "codellama",
    },
    ollamaContext: {
      type: "string",
      default: Bun.env.OLLAMA_CONTEXT?.length
        ? Bun.env.OLLAMA_CONTEXT
        : context.ollama,
    },
    ollamaTimeout: {
      type: "string",
      default: Bun.env.OLLAMA_TIMEOUT ?? "60000",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (
  !Bun.env.TEST_RUNNER?.length &&
  !values.openaiKey?.length &&
  !values.copilotApiKey?.length &&
  !values.authCopilot &&
  !values.authCodeium &&
  values.handler !== "codeium" &&
  values.handler !== "ollama"
) {
  throw new Error("no handler key provided");
}

export default {
  ...values,
  triggerCharacters: (values.triggerCharacters as string).split("||"),
  debounce: parseInt(values.debounce as string),
  fetchTimeout: parseInt(values.fetchTimeout as string),
  actionTimeout: parseInt(values.actionTimeout as string),
  completionTimeout: parseInt(values.completionTimeout as string),
  numSuggestions: parseInt(values.numSuggestions as string),
  suggestions: parseInt(values.suggestions as string),
};
