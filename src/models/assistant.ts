import config from "../config"
import { log } from "../utils"

interface Provider {
  chat?(request: string, contents: any, filepath: string, language: string): Promise<any>
  completion?(contents: any, filepath: string, language: string): Promise<any>
}

const providers: Record<string, Provider> = {}

const registerProvider = (key: string, provider: Provider) => {
  providers[key] = provider
}

const getProvider = (key: string): Provider => {
  if (!providers[config.handler]) {
    const error = `no provider: ${config.handler}`
    log(error)
    throw new Error(error)
  }

  return providers[config.handler]
}

const chat = async (...args: any[]) => {
  log(config.handler, "chat request", JSON.stringify(args))
  const provider = getProvider(config.handler)

  if (!provider.chat) {
    const error = `No chat provider for: ${config.handler}`
    log(error)
    throw new Error(error)
  }

  return provider.chat(...args)
}

const completion = async (...args: any[]) => {
  log(config.handler, "completion request")
  const provider = getProvider(config.handler)

  if (!provider.completion) {
    const error = `No completion provider for: ${config.handler}`
    log(error)
    throw new Error(error)
  }

  return provider.completion(...args)
}

export default { chat, completion, registerProvider }
