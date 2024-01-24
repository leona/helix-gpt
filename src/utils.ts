import { appendFileSync } from "node:fs"
import config from "./config"

export const getContent = async (contents: string, line: number, column: number) => {
  const lines = contents.split('\n').slice(0, line + 1)
  lines[lines.length - 1] = lines[lines.length - 1].split('').slice(0, column).join('')
  const lastLine = lines[lines.length - 1]
  const contentBefore = lines.join('\n')
  const contentAfter = contents.split('\n').slice(line + 1).join('\n')
  const lastCharacter = contentBefore.slice(-1)
  const templatedContent = `${contentBefore}<BEGIN_COMPLETION>\n${contentAfter}`

  return { contentBefore, contentAfter, lastCharacter, templatedContent, lastLine }
}

export const log = (...args: any) => {
  if (!config.logFile) return

  if (Bun.env.TEST_RUNNER) {
    console.log(xlog(...args))
  } else {
    appendFileSync(config.logFile, xlog(...args) + "\n\n")
  }
}

export const xlog = (...args: any) => {
  let newArgs = [];

  args.forEach((arg) => {
    newArgs.push(arg);
    newArgs.push("|");
  });

  newArgs = newArgs.slice(0, newArgs.length - 1);
  return ["APP", new Date().toISOString(), "-->", ...newArgs].join(' ')
};

export const uniqueStringArray = (array: string[]): string[] => {
  return Array.from(new Set(array));
};
