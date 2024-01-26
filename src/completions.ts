import { parseQueryStringToken, currentUnixTimestamp, log, genHexStr, uniqueStringArray } from "./utils"
import config from "./config"
import openai from "./openai"

let copilotToken: string

export const handlers = {
  openai: async (contents: any, filepath: string, languageId: string, suggestions = 3) => {
    const messages = [
      {
        role: "system",
        content: config.openaiContext.replace("<languageId>", languageId) + "\n\n" + `End of file context:\n\n${contents.contentAfter}`
      },
      {
        role: "user",
        content: `Start of file context:\n\n${contents.contentBefore}`
      }
    ]

    const body = {
      model: config.openaiModel,
      max_tokens: parseInt(config.openaiMaxTokens as string),
      n: suggestions,
      temperature: 1,
      top_p: 0.7,
      frequency_penalty: 1,
      presence_penalty: 2,
      messages
    }

    const headers = {
      "Authorization": `Bearer ${config.openaiKey}`,
      "Content-Type": "application/json"
    }

    return await openai.standard(config.openaiEndpoint as string, headers, body)
  },
  copilot: async (contents: any, filepath: string, language: string, suggestions = 3) => {
    const parsedToken = parseQueryStringToken(copilotToken)

    if (!parsedToken?.exp || parseInt(parsedToken.exp) <= currentUnixTimestamp()) {
      log("refreshing copilot token")

      const response = await fetch(`https://api.github.com/copilot_internal/v2/token`, {
        headers: {
          'Authorization': `Bearer ${config.copilotApiKey}`
        }
      })

      if (!response.ok) {
        log("failed to refresh copilot token", response.status, await response.text())
        throw new Error("failed to refresh copilot token: " + response.status)
      }

      const { token } = await response.json()
      copilotToken = token
      log("updated token", token)
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "GithubCopilot/1.155.0",
      "Authorization": `Bearer ${copilotToken}`,
      "Editor-Plugin-Version": "copilot/1.155.0",
      "Editor-Version": "vscode/1.85.1",
      "Openai-Intent": "copilot-ghost",
      "Openai-Organization": "github-copilot",
      "VScode-MachineId": genHexStr(64),
      "VScode-SessionId": genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(25),
      "X-Request-Id": genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(12),
      "Accept-Encoding": "gzip,deflate,br",
      "Accept": "*/*",
    }

    const body = {
      "extra": {
        "language": language,
        "next_indent": 0,
        "prompt_tokens": 500,
        "suffix_tokens": 400,
        "trim_by_indentation": true
      },
      "max_tokens": 500,
      "n": suggestions,
      "nwo": "app",
      "prompt": `// Path: ${filepath.replace('file://', '')}\n${contents.contentBefore}`,
      "stop": [
        "\n\n"
      ],
      "stream": true,
      "suffix": contents.contentAfter,
      "temperature": suggestions > 1 ? 0.4 : 0,
      "top_p": 1
    }

    try {
      return await openai.stream("https://copilot-proxy.githubusercontent.com/v1/engines/copilot-codex/completions", headers, body)
    } catch (e) {
      log("copilot request failed: " + e.message)
      throw e
    }
  },
  copilotOld: async (contents: any, language: string, suggestions = 3) => {
    // Leaving this here. Other copilot handler is how vscode does it.
    const parsedToken = parseQueryStringToken(copilotToken)

    if (!parsedToken?.exp || parseInt(parsedToken.exp) <= currentUnixTimestamp()) {
      log("refreshing copilot token")

      const response = await fetch(`https://api.github.com/copilot_internal/v2/token`, {
        headers: {
          'Authorization': `Bearer ${config.copilotApiKey}`
        }
      })

      if (!response.ok) {
        log("failed to refresh copilot token", response.status, await response.text())
        throw new Error("failed to refresh copilot token: " + response.status)
      }

      const { token } = await response.json()
      copilotToken = token
      log("updated token", token)
    }

    const messages = [
      {
        role: "system",
        content: config.copilotContext.replace("<languageId>", language) + "\n\n" + `End of file context:\n\n${contents.contentAfter}`
      },
      {
        role: "user",
        content: `Start of file context:\n\n${contents.contentBefore}`
      }
    ]

    const body = {
      model: config.copilotModel,
      maxTokens: 8192,
      maxRequestTokens: 6144,
      maxResponseTokens: 2048,
      baseTokensPerMessage: 4,
      baseTokensPerName: -1,
      baseTokensPerCompletion: 3,
      n: suggestions,
      messages
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "GitHubCopilotChat/0.8.0",
      "Authorization": `Bearer ${copilotToken}`,
      "Editor-Plugin-Version": "copilot-chat/0.8.0",
      "Editor-Version": "vscode/1.83.1",
      "Openai-Intent": "conversation-panel",
      "Openai-Organization": "github-copilot",
      "VScode-MachineId": genHexStr(64),
      "VScode-SessionId": genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(25),
      "X-Request-Id": genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(12),
      "Accept-Encoding": "gzip,deflate,br",
      "Accept": "*/*",
      "Connection": "close"
    }
    try {
      return await openai.standard(config.copilotEndpoint as string + "/chat/completions", headers, body)
    } catch (e) {
      log("copilot request failed: " + e.message)
      throw e
    }
  }
}

export const completion = async (contents: any, language: string, suggestions = 3) => {
  if (!handlers[config.handler]) {
    log("completion handler does not exist")
    throw new Error(`completion handler: ${config.handler} does not exist`)
  }

  try {
    log("running handler:", config.handler)
    return uniqueStringArray(await handlers[config.handler](contents, language, suggestions))
  } catch (e) {
    log("completion failed", e.message)
    throw new Error("Completion failed: " + e.message)
  }
}


