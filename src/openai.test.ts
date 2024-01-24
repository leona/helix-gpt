import { expect, test } from "bun:test";
import { getHints } from "./openai"

const prettyPrintHints = (hints: string[]): void => {
  hints.forEach((hint, index) => {
    console.log(`Hint ${index + 1}: ${hint}`);
  });
};

test("suggestion", async () => {
  const hints = await getHints("const charset = ", "typescript", 3)
  expect(hints.length).toBe(3);
  console.log("simple")
  prettyPrintHints(hints);

  const functionHints = await getHints("function randomString(length: number): string {", "typescript", 5);
  expect(functionHints.length).toBe(5);
  console.log("function suggestions");
  prettyPrintHints(functionHints)
})
