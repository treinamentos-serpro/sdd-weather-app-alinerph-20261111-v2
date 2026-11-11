import { forecastDates, isCivilDate, isLocalDateTime, isValidTimeZone } from '../lib/date-format';
import { weatherCondition } from '../lib/weather-code';
import type { City, CurrentWeatherState, FiveDayForecast, ForecastDay, ForecastState, WeatherData } from '../types/weather';
import { requestJson, WeatherServiceError } from './openMeteoClient';

export { WeatherServiceError } from './openMeteoClient';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeCity(value: unknown): City {
  if (!isRecord(value)) throw new WeatherServiceError('invalid-response');
  const { id, name, latitude, longitude, country, country_code, admin1, timezone } = value;
  if (
    typeof id !== 'number' || !Number.isFinite(id) ||
    typeof name !== 'string' ||
    typeof latitude !== 'number' || !Number.isFinite(latitude) ||
    typeof longitude !== 'number' || !Number.isFinite(longitude) ||
    [country, country_code, admin1, timezone].some((field) => field != null && typeof field !== 'string')
  ) {
    throw new WeatherServiceError('invalid-response');
  }

  return {
    id,
    name,
    latitude,
    longitude,
    ...(typeof country === 'string' && { country }),
    ...(typeof country_code === 'string' && { countryCode: country_code }),
    ...(typeof admin1 === 'string' && { admin1 }),
    ...(typeof timezone === 'string' && { timezone }),
  };
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const data = await requestJson(url, signal);
  if (!isRecord(data)) throw new WeatherServiceError('invalid-response');
  if (data.results == null) return [];
  if (!Array.isArray(data.results)) throw new WeatherServiceError('invalid-response');

  return data.results.slice(0, 10).map(normalizeCity);
}

function optionalNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new WeatherServiceError('invalid-response');
  return value;
}

function optionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') throw new WeatherServiceError('invalid-response');
  return value;
}

function normalizeCurrent(current: Record<string, unknown>, timeZone: string): CurrentWeatherState {
  const temperatureC = optionalNumber(current.temperature_2m);
  const code = optionalNumber(current.weather_code);
  const observedAtLocal = optionalString(current.time);
  const apparentTemperatureC = optionalNumber(current.apparent_temperature);
  const relativeHumidity = optionalNumber(current.relative_humidity_2m);
  const windSpeedKmh = optionalNumber(current.wind_speed_10m);

  if (temperatureC === undefined || code === undefined || observedAtLocal === undefined || !isLocalDateTime(observedAtLocal)) {
    return { status: 'empty', reason: 'missing-required-data' };
  }

  return {
    status: 'success',
    data: {
      timeZone, temperatureC, condition: weatherCondition(code), observedAtLocal,
      ...(apparentTemperatureC !== undefined && { apparentTemperatureC }),
      ...(relativeHumidity !== undefined && { relativeHumidity }),
      ...(windSpeedKmh !== undefined && { windSpeedKmh }),
    },
  };
}

export async function getCurrent(city: City, signal?: AbortSignal): Promise<CurrentWeatherState> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });
  const data = await requestJson(`https://api.open-meteo.com/v1/forecast?${params}`, signal);
  if (!isRecord(data) || (data.current != null && !isRecord(data.current))) {
    throw new WeatherServiceError('invalid-response');
  }
  if (!isValidTimeZone(data.timezone) || !isRecord(data.current)) {
    return { status: 'empty', reason: 'missing-required-data' };
  }
  return normalizeCurrent(data.current, data.timezone);
}

function optionalArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new WeatherServiceError('invalid-response');
  return value;
}

function normalizeForecast(daily: Record<string, unknown>, timeZone: string): FiveDayForecast {
  const dates = optionalArray(daily.time).map(optionalString);
  const codes = optionalArray(daily.weather_code).map(optionalNumber);
  const minimums = optionalArray(daily.temperature_2m_min).map(optionalNumber);
  const maximums = optionalArray(daily.temperature_2m_max).map(optionalNumber);
  const probabilities = optionalArray(daily.precipitation_probability_max).map(optionalNumber);
  const indices = new Map<string, number>();

  dates.forEach((date, index) => {
    if (date === undefined) return;
    if (!isCivilDate(date) || indices.has(date)) throw new WeatherServiceError('invalid-response');
    indices.set(date, index);
  });

  function dayForDate(dateLocal: string): ForecastDay {
    const index = indices.get(dateLocal);
    if (index === undefined) return { status: 'unavailable', dateLocal, missingFields: ['dateLocal'] };

    const code = codes[index];
    const minimumTemperatureC = minimums[index];
    const maximumTemperatureC = maximums[index];
    const missingFields: Array<'condition' | 'minimumTemperatureC' | 'maximumTemperatureC'> = [];
    if (code === undefined) missingFields.push('condition');
    if (minimumTemperatureC === undefined) missingFields.push('minimumTemperatureC');
    if (maximumTemperatureC === undefined) missingFields.push('maximumTemperatureC');
    if (code === undefined || minimumTemperatureC === undefined || maximumTemperatureC === undefined) {
      return { status: 'unavailable', dateLocal, missingFields };
    }

    const precipitationProbabilityMax = probabilities[index];
    return {
      status: 'available', dateLocal, condition: weatherCondition(code), minimumTemperatureC, maximumTemperatureC,
      ...(precipitationProbabilityMax !== undefined && { precipitationProbabilityMax }),
    };
  }

  const [first, second, third, fourth, fifth] = forecastDates(timeZone);
  return { timeZone, days: [dayForDate(first), dayForDate(second), dayForDate(third), dayForDate(fourth), dayForDate(fifth)] };
}

export async function getForecast(city: City, signal?: AbortSignal): Promise<ForecastState> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    temperature_unit: 'celsius',
    timezone: 'auto',
  });
  const data = await requestJson(`https://api.open-meteo.com/v1/forecast?${params}`, signal);
  if (!isRecord(data) || (data.daily != null && !isRecord(data.daily))) {
    throw new WeatherServiceError('invalid-response');
  }
  if (!isValidTimeZone(data.timezone)) return { status: 'empty', reason: 'missing-required-data' };
  return { status: 'success', data: normalizeForecast(isRecord(data.daily) ? data.daily : {}, data.timezone) };
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });
  const data = await requestJson(`https://api.open-meteo.com/v1/forecast?${params}`, signal);
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError('invalid-response');
  }
  if (!isValidTimeZone(data.timezone)) {
    return {
      city,
      current: { status: 'empty', reason: 'missing-required-data' },
      forecast: { status: 'empty', reason: 'missing-required-data' },
    };
  }

  return {
    city,
    current: normalizeCurrent(data.current, data.timezone),
    forecast: { status: 'success', data: normalizeForecast(data.daily, data.timezone) },
  };
}