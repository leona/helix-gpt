import Codeium from "../providers/codeium";

export default async () => {
  const codeium = new Codeium();
  const authUrl = codeium.authUrl()
  console.log(`Visit the following URL and enter the token below: ${authUrl}`)
  const input = prompt("Token: ")
  const apiKey = await codeium.register(input?.trim() as string)
  console.log(`\nCodeium API key: ${apiKey}`)
}
