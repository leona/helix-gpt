export const context = `Continue the input code from the language <languageId> at the <BEGIN_COMPLETION> marker. Only respond with code.`
export const examples = [
  {
    role: "user",
    content: `function randomInt(<BEGIN_COMPLETION>`
  },
  {
    role: "assistant",
    content: `min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}`
  }
]

