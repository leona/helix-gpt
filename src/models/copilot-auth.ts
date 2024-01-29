import Github from "../providers/github"

export default async () => {
  const github = new Github()

  const deviceCode = await github.deviceCode()
  console.log(`Visit: ${deviceCode.verificationUri} in your browser and enter: ${deviceCode.userCode}`)

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const auth = await github.accessToken(deviceCode.deviceCode)

    if (auth?.accessToken?.length) {
      console.log("\n\nGot token:", auth.accessToken, "\n\n", "Store this in the COPILOT_API_KEY environment variable")
      break
    }

    console.log("Waiting for user authorization...")
  }
}
