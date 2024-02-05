import { genHexStr, currentUnixTimestamp } from "../utils";
import ApiBase from "../models/api"
import * as types from "./codeium.types"
import config from "../config"

export default class Codeium extends ApiBase {

  // copilotSession?: types.CopilotSession

  constructor() {
    super({
      url: 'https://github.com',
      headers: {
        "Content-Type": "application/json"
      }
    })
  }

  authUrl(): string {
    const uuid = genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(25)
    return `https://codeium.com/profile?response_type=token&redirect_uri=vim-show-auth-token&state=${uuid}&scope=openid%20profile%20email&redirect_parameters_type=query`
  }
}
