import { parseArgs } from "util"
import { context } from "./constants"
import copilotAuth from "./models/copilot-auth"

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
      default: Bun.env.OPENAI_ENDPOINT ?? 'https://api.openai.com/v1/chat/completions'
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
    }
  },
  strict: true,
  allowPositionals: true,
});


if (values.authCopilot) {
  await copilotAuth()
  process.exit(0)
}

if (!Bun.env.TEST_RUNNER?.length && !values.openaiKey?.length && !values.copilotApiKey?.length) {
  throw new Error("no handler key provided")
}

export default values
