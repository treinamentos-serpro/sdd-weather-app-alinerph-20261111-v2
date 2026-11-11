import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getCurrent, getForecast, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getCurrent: vi.fn(), getForecast: vi.fn() };
});

const city: City = { id: 1, name: 'Recife', latitude: -8, longitude: -35 };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrent).mockResolvedValue({ status: 'empty', reason: 'missing-required-data' });
  vi.mocked(getForecast).mockResolvedValue({ status: 'empty', reason: 'missing-required-data' });
});

describe('useWeather: busca', () => {
  it('valida a busca e exige seleção explícita mesmo com um resultado', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    const { result } = renderHook(() => useWeather());
    expect(result.current.searchState.status).toBe('idle');
    await act(() => result.current.search(' '));
    expect(searchCities).not.toHaveBeenCalled();
    await act(() => result.current.search(' Recife '));
    expect(result.current.query).toBe('Recife');
    expect(result.current.searchState).toEqual({ status: 'success', data: [city] });
    expect(result.current.selectedCity).toBeNull();
    await act(async () => { result.current.selectCity(city); });
    expect(result.current.selectedCity).toEqual(city);
    expect(result.current.searchState.status).toBe('idle');
  });

  it('expõe ausência de resultados e erros', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockRejectedValueOnce(new WeatherServiceError('network'));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Recife'));
    expect(result.current.searchState).toEqual({ status: 'empty', reason: 'no-results' });
    await act(() => result.current.search('Recife'));
    expect(result.current.searchState).toEqual({ status: 'error', error: { kind: 'network' } });
  });

  it('ignora respostas de pesquisas substituídas', async () => {
    let resolveOld: ((cities: City[]) => void) | undefined;
    vi.mocked(searchCities).mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce([{ ...city, id: 2, name: 'Natal' }]);
    const { result } = renderHook(() => useWeather());
    act(() => { void result.current.search('Recife'); });
    expect(result.current.searchState.status).toBe('loading');
    await act(() => result.current.search('Natal'));
    await act(async () => { resolveOld?.([city]); });
    await waitFor(() => expect(result.current.searchState).toMatchObject({ status: 'success', data: [{ name: 'Natal' }] }));
  });
});

describe('useWeather: painéis independentes', () => {
  it('mantém a previsão quando o clima atual falha', async () => {
    vi.mocked(getCurrent).mockRejectedValue(new WeatherServiceError('network'));
    vi.mocked(getForecast).mockResolvedValue({ status: 'empty', reason: 'missing-required-data' });
    const { result } = renderHook(() => useWeather());
    act(() => result.current.selectCity(city));
    expect(result.current.current.status).toBe('loading');
    expect(result.current.forecast.status).toBe('loading');
    await waitFor(() => expect(result.current.current).toEqual({ status: 'error', error: { kind: 'network' } }));
    expect(result.current.forecast).toEqual({ status: 'empty', reason: 'missing-required-data' });
  });

  it('ignora respostas de seleções anteriores, inclusive da mesma cidade', async () => {
    let resolveOld: ((value: Awaited<ReturnType<typeof getForecast>>) => void) | undefined;
    vi.mocked(getForecast).mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce({ status: 'empty', reason: 'no-data' });
    const { result } = renderHook(() => useWeather());
    act(() => result.current.selectCity(city));
    act(() => result.current.selectCity(city));
    await waitFor(() => expect(result.current.forecast).toEqual({ status: 'empty', reason: 'no-data' }));
    await act(async () => { resolveOld?.({ status: 'empty', reason: 'missing-required-data' }); });
    expect(result.current.forecast).toEqual({ status: 'empty', reason: 'no-data' });
  });

  it('ignora uma busca pendente após selecionar uma cidade', async () => {
    let resolveSearch: ((cities: City[]) => void) | undefined;
    vi.mocked(searchCities).mockImplementation(() => new Promise((resolve) => { resolveSearch = resolve; }));
    const { result } = renderHook(() => useWeather());
    act(() => { void result.current.search('Recife'); });
    await act(async () => { result.current.selectCity(city); });
    await act(async () => { resolveSearch?.([city]); });
    expect(result.current.searchState.status).toBe('idle');
  });
});

describe('useWeather: retry manual', () => {
  it('repete apenas a busca que falhou', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('timeout')).mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' Recife '));
    expect(result.current.searchState.status).toBe('error');
    expect(searchCities).toHaveBeenCalledTimes(1);
    await act(async () => { result.current.retrySearch(); });
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(vi.mocked(searchCities).mock.calls[1][0]).toBe('Recife');
    expect(result.current.searchState.status).toBe('success');
    expect(getCurrent).not.toHaveBeenCalled();
    expect(getForecast).not.toHaveBeenCalled();
  });

  it('repete só o painel com erro e mantém o outro', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(new WeatherServiceError('network'))
      .mockResolvedValueOnce({ status: 'empty', reason: 'no-data' });
    const { result } = renderHook(() => useWeather());
    await act(async () => { result.current.selectCity(city); });
    expect(result.current.forecast.status).toBe('error');
    expect(result.current.current).toEqual({ status: 'empty', reason: 'missing-required-data' });
    await act(async () => { result.current.retryForecast(); });
    expect(getForecast).toHaveBeenCalledTimes(2);
    expect(getCurrent).toHaveBeenCalledTimes(1);
    expect(result.current.forecast).toEqual({ status: 'empty', reason: 'no-data' });
    expect(result.current.current).toEqual({ status: 'empty', reason: 'missing-required-data' });
  });
});