import { uniqueStringArray } from "../utils"

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super()
    this.push(...uniqueStringArray(items))
  }

  static fromResponse(data: any): Completion {
    console.log(123, data)
    return data.completionItems.map(i => i.completion.text)
  }
}
