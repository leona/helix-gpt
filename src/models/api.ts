import { log } from "../utils"
import config from "../config";

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
  private controller: AbortController;

  constructor({ url, headers, params }: ApiBaseOptions) {
    this.url = url;
    this.headers = headers || {};
    this.params = params || {};
    this.controller = new AbortController();
  }

  async fetch(
    url: string,
    options: RequestInitTimeout,
    timeout: number = config.fetchTimeout): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => {
        this.controller.abort()
        reject(new Error("timeout"))
      }, timeout);

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

    // cancel last pending request
    this.controller.abort();
    this.controller = new AbortController();

    let opts = {
      headers: {
        ...this.headers,
        ...headers,
      },
      method,
      body: null as any,
      signal: this.controller.signal
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
