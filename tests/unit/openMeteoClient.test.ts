import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout, requestJson, WeatherServiceError } from '../../src/services/openMeteoClient';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('fetchWithTimeout', () => {
  it('retorna a resposta e remove o timer após sucesso', async () => {
    vi.useFakeTimers();
    const response = new Response('ok');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    expect(await fetchWithTimeout('https://example.test')).toBe(response);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [new DOMException('Aborted', 'AbortError'), 'timeout', 'A requisição demorou demais.'],
    [new TypeError('network'), 'network', 'Falha de rede.'],
  ])('classifica falha de transporte e remove o timer', async (error, kind, message) => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    const result = fetchWithTimeout('https://example.test');
    await expect(result).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(result).rejects.toMatchObject({ kind, message });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborta após dez segundos e ignora uma resposta tardia', async () => {
    vi.useFakeTimers();
    let resolveFetch: ((response: Response) => void) | undefined;
    const fetch = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { resolveFetch = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const result = fetchWithTimeout('https://example.test');
    const assertion = expect(result).rejects.toMatchObject({ kind: 'timeout', message: 'A requisição demorou demais.' });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    resolveFetch?.(new Response('tardia'));
    await expect(result).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('mantém o timeout durante a leitura do corpo JSON', async () => {
    vi.useFakeTimers();
    const response = { ok: true, json: () => new Promise(() => {}) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    const result = requestJson('https://example.test');
    const assertion = expect(result).rejects.toMatchObject({ kind: 'timeout', message: 'A requisição demorou demais.' });
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserva cancelamento externo sem apresentar erro de timeout', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetch);
    const result = fetchWithTimeout('https://example.test', controller.signal);
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});