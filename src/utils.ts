import config from "./config"
import crypto from "crypto"
import fs from "fs"

const debounces: Record<string, NodeJS.Timeout> = {}

export const debounce = (key: string, fn: () => void, timeoutMs: number) => {
  if (debounces[key]) clearTimeout(debounces[key])
  debounces[key] = setTimeout(fn, timeoutMs)
}

export const parseQuery = (queryString: string) => {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
}

export const genHexStr = (length: number) => {
  const bytes = crypto.randomBytes(length / 2);
  return bytes.toString('hex');
}

export const uuid = () => {
  return genHexStr(8) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(4) + "-" + genHexStr(12);
}

export const getContent = async (contents: string, line: number, column: number) => {
  const lines = contents?.split('\n').slice(0, line + 1)
  lines[lines.length - 1] = lines[lines.length - 1].split('').slice(0, column).join('')
  const lastLine = lines[lines.length - 1]
  const contentBefore = lines.join('\n')
  const contentAfter = contents?.split('\n').slice(line + 1).join('\n')
  const lastCharacter = contentBefore.slice(-1)
  const contentImmediatelyAfter = contents?.split('\n')[line].slice(column)
  return { contentBefore, contentAfter, lastCharacter, lastLine, contentImmediatelyAfter }
}

let logStream: fs.WriteStream | undefined

export const log = (...args: any) => {
  if (!config.logFile) return

  if (Bun.env.TEST_RUNNER) {
    console.log(xlog(...args))
  } else if (config.logFile?.length) {
    if (!logStream) logStream = fs.createWriteStream(config.logFile)

    try {
      logStream.write(xlog(...args) + "\n\n")
    } catch (e) { }
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

export const parseQueryStringToken = (input: string): Record<string, string> => {
  if (!input?.length) return {}
  const record: Record<string, string> = {};
  const pairs = input.split(";");

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    record[key] = value;
  }

  return record;
}

export const currentUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000)
}

export const extractCodeBlock = (filepath: string, text: string, language: string): string | undefined => {
  const pattern = new RegExp(`\`\`\`${language}([\\s\\S]*?)\`\`\``, 'g');
  let match;
  const blocks: string[] = [];

  while ((match = pattern.exec(text)) !== null) {
    blocks.push(match[0]);
  }

  const result = blocks[0];
  if (!result?.length) return
  const lines = result?.replace(`// FILEPATH: ${filepath.replace('file://', '')}\n`, '')?.split('\n');
  return lines?.slice(1, lines.length - 1)?.join('\n') + "\n";
}

export const bytesToString = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  else if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB"
  else return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
}

