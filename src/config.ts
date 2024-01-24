import { parseArgs } from "util"
import { context } from "./constants"

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    openaiKey: {
      type: 'string',
      default: Bun.env.OPENAI_API_KEY
    },
    openaiContext: {
      type: 'string',
      default: Bun.env.OPENAI_CONTEXT?.length ? Bun.env.OPENAI_CONTEXT : context
    },
    openaiModel: {
      type: 'string',
      default: Bun.env.OPENAI_MODEL ?? "gpt-3.5-turbo-16k"
    },
    openaiMaxTokens: {
      type: 'string',
      default: Bun.env.OPENAI_MAX_TOKENS ?? "7000"
    },
    logFile: {
      type: 'string',
      default: Bun.env.LOG_FILE
    },
    openaiEndpoint: {
      type: 'string',
      default: Bun.env.OPENAI_ENDPOINT ?? 'https://api.openai.com/v1/chat/completions'
    }
  },
  strict: true,
  allowPositionals: true,
});

if (!values.openaiKey?.length) {
  throw new Error("no openai key provided")
}

export default values
