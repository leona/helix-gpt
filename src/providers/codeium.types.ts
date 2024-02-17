import { uniqueStringArray } from "../utils"

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super()
    this.push(...uniqueStringArray(items))
  }

  static fromResponse(data: any): Completion {
    return data.completionItems?.map(i => i.completion.text)
  }
}
