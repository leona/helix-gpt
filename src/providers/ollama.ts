import ApiBase from "../models/api";
import * as types from "./ollama.types";
import config from "../config";
import { log } from "../utils";

export default class Ollama extends ApiBase {
  private timeout: number;
  private model: string;

  constructor() {
    super({
      url: config.ollamaEndpoint as string,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.timeout = parseInt(config.ollamaTimeout, 10);
    this.model = config.ollamaModel;
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

    log(
      "prompt",
      messages.map((m) => `role: ${m.role}\n${m.content}`).join("\n"),
    );

    const body = {
      model: this.model,
      stream: false,
      messages,
    };

    const data = await this.request({
      method: "POST",
      body,
      endpoint: "/api/chat",
      timeout: this.timeout,
    });

    log("content", data.message.content);

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
          config.ollamaContext?.replace("<languageId>", languageId) +
          "\n\n" +
          `End of file context:\n\n${contents.contentAfter}`,
      },
      {
        role: "user",
        content: `Start of file context:\n\n${contents.contentBefore}`,
      },
    ];

    log(
      "prompt",
      messages.map((m) => `role: ${m.role}\n${m.content}`).join("\n"),
    );

    const body = {
      model: this.model,
      stream: false,
      messages,
    };

    const data = await this.request({
      method: "POST",
      body,
      endpoint: "/api/chat",
      timeout: this.timeout,
    });

    log("content", data.message.content);

    return types.Completion.fromResponse(data);
  }
}
