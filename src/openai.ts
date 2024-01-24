import { examples } from "./constants"
import { log, uniqueStringArray } from "./utils"
import config from "./config"

export const getHints = async (contents: string, languageId: string, suggestions = 3) => {
  const messages = [
    {
      "role": "system",
      "content": config.openaiContext.replace('<languageId>', languageId)
    },
    ...examples,
    {
      "role": "user",
      "content": contents
    }
  ]

  const body = {
    "model": config.openaiModel,
    "max_tokens": parseInt(config.openaiMaxTokens as string),
    "n": suggestions,
    "temperature": 1,
    "top_p": 0.7,
    "frequency_penalty": 1,
    presence_penalty: 2,
    messages
  }

  log("sending openai request", JSON.stringify(messages))

  const response = await fetch(config.openaiEndpoint as string, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    log("openai error", response.status, await response.text())
    throw new Error("openai request failed with code: " + response.status)
  }

  const data = await response.json()
  return uniqueStringArray(data?.choices?.map(i => i.message?.content))
}
