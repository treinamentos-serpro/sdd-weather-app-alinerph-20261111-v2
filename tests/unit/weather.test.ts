import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/mocks/weather';
import type { AsyncState, City, CurrentWeather, FiveDayForecast, ForecastDay } from '../../src/types/weather';

describe('contratos meteorológicos', () => {
  it('aceita dados mínimos e estados independentes', () => {
    const city: City = { id: 1, name: 'Cidade', latitude: 0, longitude: 0 };
    const current: CurrentWeather = {
      timeZone: 'UTC',
      temperatureC: 0,
      condition: { code: 0, label: 'Céu limpo' },
      observedAtLocal: '2026-11-11T00:00',
    };
    const states: AsyncState<CurrentWeather>[] = [
      { status: 'idle' },
      { status: 'loading' },
      { status: 'success', data: current },
      { status: 'empty', reason: 'missing-required-data' },
      { status: 'error', error: { kind: 'network' } },
    ];
    const unavailable: ForecastDay = {
      status: 'unavailable',
      dateLocal: '2026-11-11',
      missingFields: ['condition'],
    };
    const forecast: FiveDayForecast = {
      timeZone: 'UTC',
      days: [unavailable, unavailable, unavailable, unavailable, unavailable],
    };

    expect(city.country).toBeUndefined();
    expect(states.map((state) => state.status)).toEqual([
      'idle', 'loading', 'success', 'empty', 'error',
    ]);
    expect(forecast.days).toHaveLength(5);
    expect(unavailable).not.toHaveProperty('minimumTemperatureC');
  });

  it('fornece cidade, condições atuais e cinco datas consecutivas no mock', () => {
    expect(mockWeatherData.city?.name).toBe('São Paulo');
    expect(mockWeatherData.current.status).toBe('success');
    expect(mockWeatherData.forecast.status).toBe('success');

    if (mockWeatherData.current.status !== 'success' || mockWeatherData.forecast.status !== 'success') {
      throw new Error('O mock deve conter dados meteorológicos.');
    }

    expect(mockWeatherData.current.data.timeZone).toBe(mockWeatherData.forecast.data.timeZone);
    expect(mockWeatherData.forecast.data.days.map((day) => day.dateLocal)).toEqual([
      '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15',
    ]);
    expect(mockWeatherData.forecast.data.days.every((day) => day.status === 'available')).toBe(true);
  });
});