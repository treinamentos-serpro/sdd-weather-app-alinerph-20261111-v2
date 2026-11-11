export type Unit = 'celsius' | 'fahrenheit';

export interface WeatherCondition {
  code: number;
  label: string;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  timeZone: string;
  temperatureC: number;
  apparentTemperatureC?: number;
  condition: WeatherCondition;
  relativeHumidity?: number;
  windSpeedKmh?: number;
  observedAtLocal: string;
}

export type ForecastDay =
  | {
      status: 'available';
      dateLocal: string;
      condition: WeatherCondition;
      minimumTemperatureC: number;
      maximumTemperatureC: number;
      precipitationProbabilityMax?: number;
    }
  | {
      status: 'unavailable';
      dateLocal: string;
      missingFields: Array<
        'dateLocal' | 'condition' | 'minimumTemperatureC' | 'maximumTemperatureC'
      >;
    };

export interface FiveDayForecast {
  timeZone: string;
  days: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
}

export type NonEmptyArray<T> = [T, ...T[]];

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty'; reason: 'no-results' | 'no-data' | 'missing-required-data' }
  | { status: 'error'; error: WeatherError };

export type CitySearchState = AsyncState<NonEmptyArray<City>>;
export type CurrentWeatherState = AsyncState<CurrentWeather>;
export type ForecastState = AsyncState<FiveDayForecast>;

export interface WeatherData {
  city: City | null;
  current: CurrentWeatherState;
  forecast: ForecastState;
}

export interface WeatherError {
  kind: 'timeout' | 'network' | 'rate-limit' | 'http' | 'invalid-response';
}