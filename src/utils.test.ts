import { expect, test } from "bun:test";
import { extractCodeBlock, parseQuery, getContent } from "./utils"

test("extractCodeBlock", async () => {
  const content = `\`\`\`typescript
// FILEPATH: /app/example.ts

/**
 * Generates a random string.
 * @returns {string} A random string.
 */
const randomString = () => Math.random().toString(36).substring(7);
\`\`\``

  const result = extractCodeBlock("/app/example.ts", content, "typescript")
  expect(result).toEqual(`
/**
 * Generates a random string.
 * @returns {string} A random string.
 */
const randomString = () => Math.random().toString(36).substring(7);
`)
})

test("parseQuery", () => {
  const result = parseQuery("q=hello&lang=typescript&limit=10")

  expect(result).toEqual({
    q: "hello",
    lang: "typescript",
    limit: "10"
  })
})

test("getContent", async () => {
  const content = "import example from './test'\n\nconst alphabet = \nconst example2 = 123"
  const { lastLine, contentBefore, contentAfter } = await getContent(content, 2, 17)
  expect(lastLine).toEqual("const alphabet = ")
  expect(contentBefore).toEqual("import example from './test'\n\nconst alphabet = ")
  expect(contentAfter).toEqual("const example2 = 123")
})


