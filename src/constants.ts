export const context = {
  openai: `Continue the input code from the language <languageId>. Only respond with code.`,
  copilot: `<languageId> completions. Only respond with code.`
}

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

export const commands = [
  {
    key: "resolveDiagnostics",
    label: "Resolve diagnostics",
    query: "Resolve the diagnostics for this code."
  },
  {
    key: "generateDocs",
    label: "Generate documentation",
    query: "Add documentation to this code."
  },
  {
    key: "improveCode",
    label: "Improve code",
    query: "Improve this code."
  },
  {
    key: "refactorFromComment",
    label: "Refactor code from a comment",
    query: "Refactor this code based on the comment."
  },
  {
    key: "writeTest",
    label: "Write a unit test",
    query: "Write a unit test for this code. Do not include any imports.",
  }
]
