import { parseArgs } from "util"
import { context } from "./constants"

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    openaiKey: {
      type: 'string',
      default: Bun.env.OPENAI_KEY
    },
    openaiContext: {
      type: 'string',
      default: Bun.env.OPENAI_CONTEXT?.length ? Bun.env.OPENAI_CONTEXT : context
    },
    openaiModel: {
      type: 'string',
      default: Bun.env.OPENAI_MODEL ?? "gpt-3.5-turbo"
    },
    logFile: {
      type: 'string',
      default: Bun.env.LOG_FILE
    }
  },
  strict: true,
  allowPositionals: true,
});

if (!values.openaiKey?.length) {
  throw new Error("no openai key provided")
}

export default values
