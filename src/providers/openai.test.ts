import { expect, test, mock, jest } from "bun:test";
import Openai from "./openai"

const openai = new Openai()

test("completion", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        "choices": [
          {
            "index": 0,
            "message": {
              "role": "assistant",
              "content": "const name: string = \"John\";\nconsole.log(\"Hello, \" + name);"
            },
          },
          {
            "index": 1,
            "message": {
              "role": "assistant",
              "content": "console.log(\"Hello, world!\");"
            },
          },
          {
            "index": 2,
            "message": {
              "role": "assistant",
              "content": "const name: string = \"John\";\nconsole.log(\"Hello, \" + name);"
            },
          }
        ],
      }),
      ok: true
    })
  );

  const result = await openai.completion("test", "file:///app/test.ts", "typescript", 3)
  expect(result).toEqual(["const name: string = \"John\";\nconsole.log(\"Hello, \" + name);", "console.log(\"Hello, world!\");"])
  expect(result.length).toEqual(2)
})

test("chat", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        "choices": [
          {
            "index": 0,
            "message": {
              "role": "assistant",
              "content": `\`\`\`typescript
// FILEPATH: /app/test.ts

if (config.authCopilot) {
  process.exit(0)
}
\`\`\``
            },
          },
        ],
      }),
      ok: true
    })
  );

  const { result } = await openai.chat("test", "test", "file:///app/test.ts", "typescript")
  expect(result).toEqual("\nif (config.authCopilot) {\n  process.exit(0)\n}\n")
})

