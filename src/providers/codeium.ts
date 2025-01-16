import { uuid } from "../utils";
import ApiBase from "../models/api";
import * as types from "./codeium.types";
import config from "../config";

const languages = {
  unspecified: 0,
  c: 1,
  clojure: 2,
  coffeescript: 3,
  cpp: 4,
  csharp: 5,
  css: 6,
  cudacpp: 7,
  dockerfile: 8,
  go: 9,
  groovy: 10,
  handlebars: 11,
  haskell: 12,
  hcl: 13,
  html: 14,
  ini: 15,
  java: 16,
  javascript: 17,
  json: 18,
  julia: 19,
  kotlin: 20,
  latex: 21,
  less: 22,
  lua: 23,
  makefile: 24,
  markdown: 25,
  objectivec: 26,
  objectivecpp: 27,
  perl: 28,
  php: 29,
  plaintext: 30,
  protobuf: 31,
  pbtxt: 32,
  python: 33,
  r: 34,
  ruby: 35,
  rust: 36,
  sass: 37,
  scala: 38,
  scss: 39,
  shell: 40,
  sql: 41,
  starlark: 42,
  swift: 43,
  tsx: 44,
  typescript: 45,
  visualbasic: 46,
  vue: 47,
  xml: 48,
  xsl: 49,
  yaml: 50,
  svelte: 51,
  toml: 52,
  dart: 53,
  rst: 54,
  ocaml: 55,
  cmake: 56,
  pascal: 57,
  elixir: 58,
  fsharp: 59,
  lisp: 60,
  matlab: 61,
  powershell: 62,
  solidity: 63,
  ada: 64,
  ocaml_interface: 65,
};

export default class Codeium extends ApiBase {
  sessionId: string;
  apiKey: string;

  constructor(apiKey: string = config.codeiumApiKey as string) {
    super({
      url: "https://web-backend.codeium.com",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.sessionId = uuid();
    this.apiKey = apiKey;
  }

  authUrl(): string {
    return `https://codeium.com/profile?response_type=token&redirect_uri=vim-show-auth-token&state=${this.sessionId}&scope=openid%20profile%20email&redirect_parameters_type=query`;
  }

  async register(token: string): Promise<string> {
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      firebase_id_token: token,
    };

    const data = await this.request({
      method: "POST",
      headers,
      url: "https://api.codeium.com",
      endpoint: "/register_user/",
      body,
    });

    return data?.api_key;
  }

  async completion(
    contents: any,
    filepath: string,
    languageId: string,
  ): Promise<types.Completion> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${this.apiKey}-${this.sessionId}`,
    };

    filepath = filepath.replace("file://", "");

    const body = {
      metadata: {
        // The editor name needs to be known by codeium
        ideName: "web",
        ideVersion: "unknown",
        // The version needs to a recent one, so codeium accepts it
        extensionVersion: "1.6.13",
        extensionName: "helix-gpt",
        apiKey: this.apiKey,
        sessionId: this.sessionId,
      },
      document: {
        editor_language: languageId,
        language: languages[languageId] as number,
        cursor_offset: contents.contentBefore.length,
        line_ending: "\n",
        absolute_path: filepath,
        relative_path: filepath,
        text: contents.contentBefore + "\n" + contents.contentAfter,
      },
      editor_options: {
        tab_size: 2,
        insert_spaces: true,
      },
      other_documents: [],
    };

    const data = await this.request({
      method: "POST",
      body,
      headers,
      endpoint: "/exa.language_server_pb.LanguageServerService/GetCompletions",
    });

    return types.Completion.fromResponse(data).slice(0, config.numSuggestions);
  }
}
