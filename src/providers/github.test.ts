import { expect, test } from "bun:test";
import Github from "./github"

const github = new Github()

// test("completion", async () => {
//   const result = await github.completion("const alphabet = ", "file:///app/test.ts", "typescript", 3)
//   console.log(result)
//   expect(result.length).toEqual(3)
// })

// test("chat", async () => {
//   const result = await github.chat("Document this code", "const alphabet = ", "file:///app/test.ts", "typescript", 3)
//   console.log(result)
// })
