import { log } from "../utils.ts";

interface Request {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  url?: string;
  text?: boolean;
  timeout?: number
}

interface ApiBaseOptions {
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

type RequestInitTimeout = RequestInit & { timeout?: number };

export default class ApiBase {
  private url: string;
  private headers: Record<string, string>;
  private params: Record<string, string>;

  constructor({ url, headers, params }: ApiBaseOptions) {
    this.url = url;
    this.headers = headers || {};
    this.params = params || {};
  }

  async fetch(
    url: string,
    options: RequestInitTimeout,
    timeout: number = 10000
  ): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => reject(new Error("timeout")), timeout);
      try {
        const response = await fetch(url, options);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  async request(request: Request): Promise<any> {
    const { endpoint, method, body, headers, params, url, timeout } = request;
    let requestUrl = new URL(endpoint, url || this.url);
    log("fetch", endpoint)

    if (params) {
      Object.keys(params).forEach((key) =>
        requestUrl.searchParams.append(key, params[key])
      );
    }

    Object.keys(this.params).forEach((key) => {
      requestUrl.searchParams.append(key, this.params[key]);
    });

    let opts = {
      headers: {
        ...this.headers,
        ...headers,
      },
      method,
      body: null as any,
    };

    if (body) {
      opts.body = JSON.stringify(body);
    }

    const response = await this.fetch(requestUrl.toString(), opts, timeout);

    if (!response.ok) {
      let error = await response.text();
      throw new Error(
        `Fetch failed with status ${response.status} body ${error} url: ${request.endpoint}`
      );
    }

    log("response", requestUrl, response.status)

    if (request.text) {
      return await response.text();
    }

    return await response.json();
  }
}
