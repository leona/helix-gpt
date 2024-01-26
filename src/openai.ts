import { log } from "./utils"

export const request = async (endpoint: string, headers: Record<string, string>, body: any) => {
  log("sending completion request", JSON.stringify(body))

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    log("completion error", response.status, await response.text())
    throw new Error("request error with status code " + response.status)
  }

  return response
}

export const standard = async (endpoint: string, headers: Record<string, string>, body: any) => {
  const response = await request(endpoint, headers, body)
  const data = await response.json()
  return data?.choices?.map(i => i.message?.content)
}

export const stream = async (endpoint: string, headers: Record<string, string>, body: any) => {
  const response = await request(endpoint, headers, body)
  const text = await response.text()

  const data = text.split('\n').map(i => i.slice(5)).map((i) => {
    try {
      return JSON.parse(i).choices[0]
    } catch (e) { return null }
  }).filter(i => i).reduce(function(r, a) {
    r[a.index] = r[a.index] || [];
    r[a.index].push(a);
    return r;
  }, Object.create(null))

  return Object.values(data).map((i) => i.map(i => i.text).join(''))
}

export default { stream, standard }
