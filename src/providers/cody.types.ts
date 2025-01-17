import { uniqueStringArray, extractCodeBlock, log } from "../utils";

export class Completion extends Array<string> {
  constructor(...items: string[]) {
    super();
    this.push(...uniqueStringArray(items));
  }

  static fromResponse(data: any): Completion {
    let parsed = JSON.parse(JSON.stringify(data));
    const result = [parsed.completion];
    return new Completion(...result);
  }
}
