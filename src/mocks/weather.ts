import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    country: 'Brasil',
    countryCode: 'BR',
    admin1: 'São Paulo',
    timezone: 'America/Sao_Paulo',
  },
  current: {
    status: 'success',
    data: {
      timeZone: 'America/Sao_Paulo',
      temperatureC: 24.3,
      apparentTemperatureC: 25.1,
      condition: { code: 2, label: 'Parcialmente nublado' },
      relativeHumidity: 65,
      windSpeedKmh: 12.4,
      observedAtLocal: '2026-11-11T14:30',
    },
  },
  forecast: {
    status: 'success',
    data: {
      timeZone: 'America/Sao_Paulo',
      days: [
        {
          status: 'available',
          dateLocal: '2026-11-11',
          condition: { code: 2, label: 'Parcialmente nublado' },
          minimumTemperatureC: 18,
          maximumTemperatureC: 27,
          precipitationProbabilityMax: 20,
        },
        {
          status: 'available',
          dateLocal: '2026-11-12',
          condition: { code: 0, label: 'Céu limpo' },
          minimumTemperatureC: 19,
          maximumTemperatureC: 29,
          precipitationProbabilityMax: 10,
        },
        {
          status: 'available',
          dateLocal: '2026-11-13',
          condition: { code: 3, label: 'Encoberto' },
          minimumTemperatureC: 20,
          maximumTemperatureC: 26,
          precipitationProbabilityMax: 30,
        },
        {
          status: 'available',
          dateLocal: '2026-11-14',
          condition: { code: 61, label: 'Chuva fraca' },
          minimumTemperatureC: 18,
          maximumTemperatureC: 24,
          precipitationProbabilityMax: 70,
        },
        {
          status: 'available',
          dateLocal: '2026-11-15',
          condition: { code: 1, label: 'Predominantemente limpo' },
          minimumTemperatureC: 17,
          maximumTemperatureC: 25,
          precipitationProbabilityMax: 15,
        },
      ],
    },
  },
};