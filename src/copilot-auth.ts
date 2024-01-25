const parseQuery = (queryString: string) => {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
}

const fetchDeviceCode = async () => {
  const response = await fetch(`https://github.com/login/device/code?client_id=Iv1.b507a08c87ecfe98&scope=read:user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`fetchDeviceCode failed: ${response.status} ${await response.text()}`)
  }

  return parseQuery(await response.text())
}

export default async () => {
  const deviceCode = await fetchDeviceCode()
  console.log(`Visit: ${deviceCode.verification_uri} in your browser and enter: ${deviceCode.user_code}`)

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const response = await fetch(`https://github.com/login/oauth/access_token?client_id=Iv1.b507a08c87ecfe98&device_code=${deviceCode.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const params = parseQuery(await response.text())

    if (params?.access_token?.length) {
      console.log("\n\nGot token:", params.access_token, "\n\n", "Store this in the COPILOT_API_KEY environment variable")
      break
    }

    console.log("Waiting for user authorization...")
  }
}
