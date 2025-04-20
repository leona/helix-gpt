import ApiBase from "../models/api";
import * as types from "./cody.types";
import config from "../config";
import { log } from "../utils";

export default class Cody extends ApiBase {
  constructor() {
    super({
      url: "https://sourcegraph.com",
      headers: {
        Authorization: `token ${config.codyToken}`,
        "X-Sourcegraph-Should-Trace": true,
        "Client-Name": "vscode",
        "Client-Version": "1.26.7",
        "User-Agent": "Cody/1.26.7",
      },
    });
  }

  async completion(
    contents: any,
    filepath: string,
    languageId: string,
    suggestions = 3,
  ): Promise<types.Completion> {
    const messages = [
      {
        text:
          config.openaiContext?.replace("<languageId>", languageId) +
          "\n\n" +
          `End of file context:\n\n${contents.contentAfter}` +
          "\n\n" +
          `Start of file context:\n\n${contents.contentBefore}`,
        speaker: "human",
      },
    ];

    const body = {
      maxTokensToSample: 4000,
      temperature: suggestions > 1 ? 0.4 : 0,
      top_p: -1,
      messages,
    };

    const request = await this.request({
      method: "POST",
      body,
      endpoint:
        "/.api/completions/code?client-name=vscode?client-version=1.26.7",
      timeout: 200000
    });

    return types.Completion.fromResponse(request);
  }
}
