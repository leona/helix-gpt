import { expect, test, mock, jest } from "bun:test";
import Ollama from "./ollama";

const ollama = new Ollama();

test("completion", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          message: {
            role: "assistant",
            content:
              'const name: string = "John";\nconsole.log("Hello, " + name);',
          },
        }),
      ok: true,
    }),
  );

  const result = await ollama.completion(
    "test",
    "file:///app/test.ts",
    "typescript",
    3,
  );
  expect(result).toEqual([
    'const name: string = "John";\nconsole.log("Hello, " + name);'
  ]);
  expect(result.length).toEqual(1);
});

test("chat", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          message: {
            role: "assistant",
            content: `\`\`\`typescript
// FILEPATH: /app/test.ts

if (config.authCopilot) {
  process.exit(0)
}
\`\`\``,
          },
        }),
      ok: true,
    }),
  );

  const { result } = await ollama.chat(
    "test",
    "test",
    "file:///app/test.ts",
    "typescript",
  );
  expect(result).toEqual("\nif (config.authCopilot) {\n  process.exit(0)\n}\n");
});
