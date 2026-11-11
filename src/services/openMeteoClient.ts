import type { WeatherError } from '../types/weather';

export class WeatherServiceError extends Error implements WeatherError {
  constructor(public readonly kind: WeatherError['kind']) {
    super(kind === 'timeout' ? 'A requisição demorou demais.' :
      kind === 'network' ? 'Falha de rede.' : `Falha na consulta meteorológica: ${kind}`);
    this.name = 'WeatherServiceError';
  }
}

export function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response>;
export function fetchWithTimeout<T>(url: string, signal: AbortSignal | undefined, processResponse: (response: Response) => Promise<T>): Promise<T>;
export async function fetchWithTimeout<T>(
  url: string,
  signal?: AbortSignal,
  processResponse?: (response: Response) => Promise<T>,
): Promise<Response | T> {
  if (signal?.aborted) throw new DOMException('Consulta cancelada', 'AbortError');

  const controller = new AbortController();
  let cancelRequest: (() => void) | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const interruption = new Promise<never>((_, reject) => {
    cancelRequest = () => {
      reject(new DOMException('Consulta cancelada', 'AbortError'));
      controller.abort();
    };
    signal?.addEventListener('abort', cancelRequest, { once: true });
    timeout = setTimeout(() => {
      reject(new WeatherServiceError('timeout'));
      controller.abort();
    }, 10_000);
  });

  const request = async (): Promise<Response | T> => {
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') {
        throw new WeatherServiceError('timeout');
      }
      throw new WeatherServiceError('network');
    }
    return processResponse ? processResponse(response) : response;
  };

  try {
    return await Promise.race([request(), interruption]);
  } finally {
    clearTimeout(timeout);
    if (cancelRequest) signal?.removeEventListener('abort', cancelRequest);
  }
}

export async function requestJson(url: string, signal?: AbortSignal): Promise<unknown> {
  return fetchWithTimeout(url, signal, async (response) => {
    if (!response.ok) {
      throw new WeatherServiceError(response.status === 429 ? 'rate-limit' : 'http');
    }

    try {
      return await response.json();
    } catch {
      throw new WeatherServiceError('invalid-response');
    }
  });
}