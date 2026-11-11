import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrent, getForecast, getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('retorna lista vazia sem rede para entrada vazia', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await searchCities('  ')).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('codifica a busca e normaliza até dez cidades na ordem recebida', async () => {
    const results = Array.from({ length: 11 }, (_, index) => ({
      id: index, name: `Cidade ${index}`, latitude: -23.5, longitude: -46.6,
      ...(index === 0 && { country: 'Brasil', country_code: 'BR', admin1: 'São Paulo', timezone: 'America/Sao_Paulo' }),
    }));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    const cities = await searchCities('  São Paulo & região  ');
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe('https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json');
    expect(cities).toHaveLength(10);
    expect(cities[0]).toEqual({ id: 0, name: 'Cidade 0', latitude: -23.5, longitude: -46.6, country: 'Brasil', countryCode: 'BR', admin1: 'São Paulo', timezone: 'America/Sao_Paulo' });
    expect(cities[1]).toEqual({ id: 1, name: 'Cidade 1', latitude: -23.5, longitude: -46.6 });
    expect(cities[9].id).toBe(9);
  });

  it.each([{}, { results: null }, { results: [] }])('retorna lista vazia para %o', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
    expect(await searchCities('Recife')).toEqual([]);
  });

  it.each([429, 500])('classifica resposta HTTP %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status })));
    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError', kind: status === 429 ? 'rate-limit' : 'http',
    });
    await expect(searchCities('Recife')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([null, [], { results: {} }, { results: [{ id: 1 }] }, { results: [{ id: 1, name: 'X', latitude: 0, longitude: 0, country: 42 }] }])(
    'rejeita estrutura inválida: %o', async (body) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
      await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'invalid-response' });
    },
  );

  it('classifica JSON inválido e falha de rede', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{')).mockRejectedValueOnce(new TypeError('network'));
    vi.stubGlobal('fetch', fetch);
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'invalid-response' });
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'network' });
  });

  it('encerra a consulta após dez segundos sem repetição', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetch);
    const result = searchCities('Recife');
    const assertion = expect(result).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('propaga cancelamento sem classificá-lo como falha de rede', async () => {
    const controller = new AbortController();
    const fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetch);
    const result = searchCities('Recife', controller.signal);
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  });
});

describe('getCurrent', () => {
  const city = { id: 1, name: 'São Paulo', latitude: -23.5, longitude: -46.6 };

  it('consulta somente condições atuais e omite opcionais ausentes', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      timezone: 'America/Sao_Paulo', current: { time: '2026-11-11T23:30', temperature_2m: 0, weather_code: 0 },
    })));
    vi.stubGlobal('fetch', fetch);
    expect(await getCurrent(city)).toEqual({ status: 'success', data: {
      timeZone: 'America/Sao_Paulo', observedAtLocal: '2026-11-11T23:30', temperatureC: 0,
      condition: { code: 0, label: 'Céu limpo' },
    } });
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('daily')).toBeNull();
    expect(url.searchParams.get('current')).toContain('weather_code');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
  });

  it('distingue dados obrigatórios ausentes de estrutura inválida', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'UTC', current: { time: '2026-11-11T23:30', weather_code: 0 } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'inválido', current: {} })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'UTC', current: [] }))));
    expect(await getCurrent(city)).toEqual({ status: 'empty', reason: 'missing-required-data' });
    expect(await getCurrent(city)).toEqual({ status: 'empty', reason: 'missing-required-data' });
    await expect(getCurrent(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });
});

describe('getForecast', () => {
  const city = { id: 1, name: 'São Paulo', latitude: -23.5, longitude: -46.6 };

  it('consulta apenas previsão e associa os dados às datas locais', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T02:30:00Z'));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      timezone: 'America/Sao_Paulo',
      daily: { time: ['2026-11-12', '2026-11-11'], weather_code: [61, 0], temperature_2m_min: [17, 18], temperature_2m_max: [24, 27] },
    })));
    vi.stubGlobal('fetch', fetch);
    const result = await getForecast(city);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('current')).toBeNull();
    expect(url.searchParams.get('daily')).toContain('weather_code');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(result.status).toBe('success');
    if (result.status !== 'success') throw new Error('Previsão ausente');
    expect(result.data.days[0]).toMatchObject({ dateLocal: '2026-11-11', status: 'available', minimumTemperatureC: 18 });
    expect(result.data.days[1]).toMatchObject({ dateLocal: '2026-11-12', status: 'available', minimumTemperatureC: 17 });
    expect(result.data.days[2]).toMatchObject({ dateLocal: '2026-11-13', status: 'unavailable' });
  });

  it('distingue fuso inválido, ausência de registros e estrutura inválida', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'inválido' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'UTC' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ timezone: 'UTC', daily: [] }))));
    expect(await getForecast(city)).toEqual({ status: 'empty', reason: 'missing-required-data' });
    const result = await getForecast(city);
    expect(result.status).toBe('success');
    if (result.status !== 'success') throw new Error('Previsão ausente');
    expect(result.data.days.every((day) => day.status === 'unavailable')).toBe(true);
    await expect(getForecast(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });
});

describe('getWeather', () => {
  const city = { id: 1, name: 'São Paulo', latitude: -23.5, longitude: -46.6 };
  const response = {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-11-11T23:30', temperature_2m: 23.4, apparent_temperature: 24.1,
      relative_humidity_2m: 61, weather_code: 2, wind_speed_10m: 12.6,
    },
    daily: {
      time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
      weather_code: [2, 61, 3, 0, 999],
      temperature_2m_min: [18.1, 17.4, 18, 19.2, 18.7],
      temperature_2m_max: [27.2, 24.3, 25.8, 28.1, 27.5],
      precipitation_probability_max: [10, 70, 25, 0, 15],
    },
  };

  it('consulta current e daily e normaliza cinco dias no fuso local', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T02:30:00Z'));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(response)));
    vi.stubGlobal('fetch', fetch);
    const result = await getWeather(city);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('-23.5');
    expect(url.searchParams.get('longitude')).toBe('-46.6');
    expect(url.searchParams.get('current')).toContain('temperature_2m');
    expect(url.searchParams.get('daily')).toContain('precipitation_probability_max');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(result.city).toEqual(city);
    expect(result.current).toEqual({ status: 'success', data: {
      timeZone: 'America/Sao_Paulo', observedAtLocal: '2026-11-11T23:30', temperatureC: 23.4,
      apparentTemperatureC: 24.1, relativeHumidity: 61, windSpeedKmh: 12.6,
      condition: { code: 2, label: 'Parcialmente nublado' },
    } });
    expect(result.forecast.status).toBe('success');
    if (result.forecast.status !== 'success') throw new Error('Previsão ausente');
    expect(result.forecast.data.days.map((day) => day.dateLocal)).toEqual(response.daily.time);
    expect(result.forecast.data.days[0]).toEqual({ status: 'available', dateLocal: '2026-11-11', condition: { code: 2, label: 'Parcialmente nublado' }, minimumTemperatureC: 18.1, maximumTemperatureC: 27.2, precipitationProbabilityMax: 10 });
    expect(result.forecast.data.days[4]).toMatchObject({ condition: { code: 999, label: 'Condição desconhecida' } });
  });

  it.each([{ current: undefined }, { daily: undefined }, { current: null }, { daily: null }])(
    'rejeita ausência de current ou daily', async (missing) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...response, ...missing }))));
      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    },
  );

  it('preserva registros por data, omite opcionais e identifica dias incompletos', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T12:00:00Z'));
    const partial = {
      ...response,
      current: { time: '2026-11-11T23:30', temperature_2m: 0, weather_code: 0 },
      daily: { time: ['2026-11-13', '2026-11-11'], weather_code: [null, 0], temperature_2m_min: [4, 0], temperature_2m_max: [8, 10] },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(partial))));
    const result = await getWeather(city);
    expect(result.current).toEqual({ status: 'success', data: { timeZone: 'America/Sao_Paulo', observedAtLocal: '2026-11-11T23:30', temperatureC: 0, condition: { code: 0, label: 'Céu limpo' } } });
    if (result.forecast.status !== 'success') throw new Error('Previsão ausente');
    expect(result.forecast.data.days).toHaveLength(5);
    expect(result.forecast.data.days[0]).toEqual({ status: 'available', dateLocal: '2026-11-11', condition: { code: 0, label: 'Céu limpo' }, minimumTemperatureC: 0, maximumTemperatureC: 10 });
    expect(result.forecast.data.days[1]).toEqual({ status: 'unavailable', dateLocal: '2026-11-12', missingFields: ['dateLocal'] });
    expect(result.forecast.data.days[2]).toEqual({ status: 'unavailable', dateLocal: '2026-11-13', missingFields: ['condition'] });
  });

  it('informa indisponibilidade para fuso inválido ou campo atual ausente', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...response, timezone: 'Invalid/Zone' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...response, current: { time: '2026-11-11T23:30', weather_code: 0 } }))));
    const invalidZone = await getWeather(city);
    expect(invalidZone.current.status).toBe('empty');
    expect(invalidZone.forecast.status).toBe('empty');
    const partial = await getWeather(city);
    expect(partial.current).toEqual({ status: 'empty', reason: 'missing-required-data' });
    expect(partial.forecast.status).toBe('success');
  });

  it('rejeita estruturas diárias inválidas e preserva erros HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...response, daily: { time: '2026-11-11' } })))
      .mockResolvedValueOnce(new Response('', { status: 500 })));
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'http' });
  });
});