import { extractCodeBlock } from "../utils"

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super();
    this.push(...items);
  }

  static fromResponse(data: any): Completion {
    const choices = data?.choices?.map(i => i.text)
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
    const result = extractCodeBlock(filepath, choices, language)
    return new Chat(result as string)
  }
}
