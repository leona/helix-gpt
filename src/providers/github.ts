import { genHexStr, currentUnixTimestamp } from "../utils";
import ApiBase from "../models/api";
import * as types from "./github.types";
import config from "../config";

export default class Github extends ApiBase {
  copilotSession?: types.CopilotSession;

  constructor() {
    super({
      url: "https://github.com",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async deviceCode(): Promise<types.DeviceCode> {
    const data = await this.request({
      method: "POST",
      endpoint: "/login/device/code",
      text: true,
      params: {
        scope: "read:user",
        client_id: "Iv1.b507a08c87ecfe98", // copilot ID
      },
    });

    return types.DeviceCode.fromResponse(data);
  }

  async accessToken(code: string): Promise<types.AccessToken> {
    const data = await this.request({
      method: "POST",
      endpoint: "/login/oauth/access_token",
      text: true,
      params: {
        client_id: "Iv1.b507a08c87ecfe98", // copilot ID
        device_code: code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      },
    });

    return types.AccessToken.fromResponse(data);
  }

  async refreshCopilotSession(): Promise<void> {
    if (
      this.copilotSession?.exp &&
      this.copilotSession?.exp >= currentUnixTimestamp()
    ) {
      return;
    }

    const data = await this.request({
      method: "GET",
      url: "https://api.github.com",
      endpoint: "/copilot_internal/v2/token",
      headers: {
        Authorization: `Bearer ${config.copilotApiKey}`,
        "Editor-Version": "helix/1.0.0",
        "Editor-Plugin-Version": "helix-gpt/1.0.0",
        "User-Agent": "helix/1.0.0",
      },
    });

    this.copilotSession = types.CopilotSession.fromResponse(data);
  }

  async chat(
    request: string,
    contents: string,
    filepath: string,
    languageId: string,
  ): Promise<types.Chat> {
    await this.refreshCopilotSession();

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
      intent: true,
      max_tokens: 7909,
      model: "gpt-4",
      n: 1,
      stream: false,
      temperature: 0.1,
      top_p: 1,
      messages,
    };

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "helix/1.0.0",
      Authorization: `Bearer ${this.copilotSession?.raw}`,
      "Editor-Plugin-Version": "copilot-chat/0.24.1",
      "Editor-Version": "vscode/1.99",
      "Openai-Intent": "conversation-panel",
      "Openai-Organization": "github-copilot",
      "VScode-MachineId": genHexStr(64),
      "VScode-SessionId":
        genHexStr(8) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(25),
      "X-Request-Id":
        genHexStr(8) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(12),
      "Accept-Encoding": "gzip,deflate,br",
      Accept: "*/*",
      Connection: "close",
    };

    const data = await this.request({
      method: "POST",
      body,
      headers,
      url: "https://api.githubcopilot.com",
      endpoint: "/chat/completions",
    });

    return types.Chat.fromResponse(data, filepath, languageId);
  }

  async completion(
    contents: any,
    filepath: string,
    languageId: string,
  ): Promise<types.Completion> {
    await this.refreshCopilotSession();

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "helix/1.0.0",
      Authorization: `Bearer ${this.copilotSession?.raw}`,
      "Editor-Plugin-Version": "copilot-chat/0.24.1",
      "Editor-Version": "vscode/1.99",
      "Openai-Intent": "copilot-ghost",
      "Openai-Organization": "github-copilot",
      "VScode-MachineId": genHexStr(64),
      "VScode-SessionId":
        genHexStr(8) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(25),
      "X-Request-Id":
        genHexStr(8) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(4) +
        "-" +
        genHexStr(12),
      "Accept-Encoding": "gzip,deflate,br",
      Accept: "*/*",
    };

    const body = {
      extra: {
        language: languageId,
        next_indent: 0,
        prompt_tokens: 500,
        suffix_tokens: 400,
        trim_by_indentation: true,
      },
      max_tokens: 500,
      n: config.numSuggestions,
      nwo: "app",
      prompt: `// Path: ${filepath.replace("file://", "")}\n${contents.contentBefore}`,
      stop: ["\n\n"],
      stream: true,
      suffix: contents.contentAfter,
      temperature: config.numSuggestions > 1 ? 0.4 : 0,
      top_p: 1,
    };

    const data = await this.request({
      method: "POST",
      body,
      headers,
      text: true,
      url: "https://proxy.individual.githubcopilot.com",
      endpoint: "/v1/engines/gpt-4o-copilot/completions",
    });

    return types.Completion.fromResponse(data);
  }
}
