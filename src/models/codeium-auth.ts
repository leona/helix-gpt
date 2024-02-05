import Codeium from "../providers/codeium";

export default async () => {
  const codeium = new Codeium();
  const authUrl = codeium.authUrl()
  console.log(`Visit the following URL and enter the token below: ${authUrl}`)

  while (true) {
    const input = prompt("Token: ")
  }

}
