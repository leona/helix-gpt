import ApiBase from "../models/api";
import * as types from "./openai.types";
import config from "../config";
import { log } from "../utils";

export default class Github extends ApiBase {
  constructor() {
    super({
      url: config.openaiEndpoint as string,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openaiKey}`,
      },
    });
  }

  async chat(
    request: string,
    contents: string,
    filepath: string,
    languageId: string,
  ): Promise<types.Chat> {
    const messages = [
      {
        content: `You are an AI programming assistant.\nWhen asked for your name, you must respond with \"GitHub Copilot\".\nFollow the user's requirements carefully & to the letter.\n- Each code block starts with \`\`\` and // FILEPATH.\n- You always answer with ${languageId} code.\n- When the user asks you to document something, you must answer in the form of a ${languageId} code block.\nYour expertise is strictly limited to software development topics.\nFor questions not related to software development, simply give a reminder that you are an AI programming assistant.\nKeep your answers short and impersonal.`,
        role: "system",
      },
      {
        content: `I have the following code in the selection:\n\`\`\`${languageId}\n// FILEPATH: ${filepath.replace("file://", "")}\n${contents}`,
        role: "user",
      },
      {
        content: request,
        role: "user",
      },
    ];

    const body = {
      max_tokens: 7909,
      model: "gpt-4",
      n: 1,
      stream: false,
      temperature: 0.1,
      top_p: 1,
      messages,
    };

    const data = await this.request({
      method: "POST",
      body,
      endpoint: "/v1/chat/completions",
      timeout: 10000,
    });

    return types.Chat.fromResponse(data, filepath, languageId);
  }

  async completion(
    contents: any,
    filepath: string,
    languageId: string,
  ): Promise<types.Completion> {
    const messages = [
      {
        role: "system",
        content:
          config.openaiContext?.replace("<languageId>", languageId) +
          "\n\n" +
          `End of file context:\n\n${contents.contentAfter}`,
      },
      {
        role: "user",
        content: `Start of file context:\n\n${contents.contentBefore}`,
      },
    ];

    const body = {
      model: config.openaiModel,
      max_tokens: parseInt(config.openaiMaxTokens as string),
      n: config.numSuggestions,
      temperature: suggestions > 1 ? 0.4 : 0,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 2,
      messages,
    };

    const data = await this.request({
      method: "POST",
      body,
      endpoint: "/v1/chat/completions",
    });

    return types.Completion.fromResponse(data);
  }
}
