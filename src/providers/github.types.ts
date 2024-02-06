import { uniqueStringArray, parseQuery, parseQueryStringToken, extractCodeBlock } from "../utils"

export class DeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
  message: string;

  constructor(query: any) {
    this.deviceCode = query.device_code
    this.userCode = query.user_code
    this.verificationUri = query.verification_uri
    this.expiresIn = query.expires_in
    this.interval = query.interval
    this.message = query.message
  }

  static fromResponse(data: string): DeviceCode {
    const query = parseQuery(data)
    return new DeviceCode(query)
  }
}

export class AccessToken {
  accessToken?: string;
  tokenType?: string;
  scope?: string;

  constructor(query: any) {
    this.accessToken = query.access_token
    this.tokenType = query.token_type
    this.scope = query.scope
  }

  static fromResponse(data: string): AccessToken {
    const query = parseQuery(data)
    return new AccessToken(query)
  }
}

export class CopilotSession {
  exp: number
  raw: string

  constructor(query: any) {
    this.exp = query.exp
    this.raw = query.raw
  }

  static fromResponse(data: any): CopilotSession {
    const parsedToken = parseQueryStringToken(data?.token)

    return new CopilotSession({
      exp: parseInt(parsedToken.exp),
      raw: data?.token
    })
  }
}

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super();
    this.push(...uniqueStringArray(items));
  }

  static fromResponse(text: string): Completion {
    const data = text.split('\n').map(i => i.slice(5)).map((i) => {
      try {
        return JSON.parse(i).choices[0]
      } catch (e) { return null }
    }).filter(i => i).reduce(function(r, a) {
      r[a.index] = r[a.index] || [];
      r[a.index].push(a);
      return r;
    }, Object.create(null))

    const items = Object.values(data).map((i) => i.map(i => i.text).join(''))
    return new Completion(...items as string[])
  }
}

export class Chat {

  result: string

  constructor(data: string) {
    this.result = data
  }

  static fromResponse(data: any, filepath: string, language: string): Chat {
    const choices = data?.choices?.map(i => i.message?.content)
    const result = extractCodeBlock(filepath, choices[0], language)
    return new Chat(result as string)
  }
}
