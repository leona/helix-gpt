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
    "max_tokens": 2048,
    "n": suggestions,
    "temperature": 0.7,
    "top_p": 1,
    "frequency_penalty": 0,
    messages
  }

  log("sending openai request", JSON.stringify(messages))

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error("openai request failed with code: " + response.status)
  }

  const data = await response.json()
  return uniqueStringArray(data?.choices?.map(i => i.message?.content))
}
