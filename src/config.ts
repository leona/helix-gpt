import { parseArgs } from "util"
import { context } from "./constants"

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    logFile: {
      type: 'string',
      default: Bun.env.LOG_FILE ?? ''
    },
    handler: {
      type: 'string',
      default: Bun.env.HANDLER ?? 'openai'
    },
    debounce: {
      type: 'string',
      default: Bun.env.DEBOUNCE ?? '400'
    },
    triggerCharacters: {
      type: 'string',
      default: Bun.env.TRIGGER_CHARACTERS ?? '{||(|| '
    },
    openaiKey: {
      type: 'string',
      default: Bun.env.OPENAI_API_KEY
    },
    openaiContext: {
      type: 'string',
      default: Bun.env.OPENAI_CONTEXT?.length ? Bun.env.OPENAI_CONTEXT : context.openai
    },
    openaiModel: {
      type: 'string',
      default: Bun.env.OPENAI_MODEL ?? "gpt-3.5-turbo-16k"
    },
    openaiMaxTokens: {
      type: 'string',
      default: Bun.env.OPENAI_MAX_TOKENS ?? "7000"
    },
    openaiEndpoint: {
      type: 'string',
      default: Bun.env.OPENAI_ENDPOINT ?? 'https://api.openai.com/v1'
    },
    copilotEndpoint: {
      type: 'string',
      default: Bun.env.GITHUB_ENDPOINT ?? 'https://api.githubcopilot.com'
    },
    copilotContext: {
      type: 'string',
      default: Bun.env.COPILOT_CONTEXT?.length ? Bun.env.COPILOT_CONTEXT : context.copilot
    },
    copilotModel: {
      type: 'string',
      default: Bun.env.COPILOT_MODEL ?? "gpt-3.5-turbo"
    },
    copilotApiKey: {
      type: 'string',
      default: Bun.env.COPILOT_API_KEY
    },
    authCopilot: {
      type: 'boolean',
      default: false
    },
    authCodeium: {
      type: 'boolean',
      default: false
    },
    codeiumApiKey: {
      type: 'string',
      default: Bun.env.CODEIUM_API_KEY ?? "d49954eb-cfba-4992-980f-d8fb37f0e942" // Public Codeium key
    }
  },
  strict: true,
  allowPositionals: true,
});

if (!Bun.env.TEST_RUNNER?.length && !values.openaiKey?.length && !values.copilotApiKey?.length && !values.autCopilot && !values.authCodeium && values.handler !== "codeium") {
  throw new Error("no handler key provided")
}

values.triggerCharacters = values.triggerCharacters.split('||')

export default values
