import { uniqueStringArray, extractCodeBlock, log } from "../utils"

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super();
    this.push(...uniqueStringArray(items));
  }

  static fromResponse(data: any): Completion {
    const choices = data?.choices?.map(i => i.message.content)
    return new Completion(...choices)
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
