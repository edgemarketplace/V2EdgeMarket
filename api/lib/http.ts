export class HttpResponseError extends Error {
  status: number;
  statusText: string;
  bodyText: string;
  contentType: string;

  constructor(response: Response, bodyText: string) {
    const contentType = response.headers.get('content-type') || '';
    super(bodyText || `HTTP ${response.status} ${response.statusText}`);
    this.name = 'HttpResponseError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.bodyText = bodyText;
    this.contentType = contentType;
  }
}

export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const bodyText = await response.text();

  if (!response.ok) {
    throw new HttpResponseError(response, bodyText);
  }

  if (!bodyText.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new Error(`Expected JSON but received non-JSON body from ${typeof input === 'string' ? input : input.toString()}`);
  }
}
