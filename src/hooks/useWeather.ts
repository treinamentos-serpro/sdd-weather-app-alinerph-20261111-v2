import { useEffect, useRef, useState } from 'react';
import { normalizeSearchQuery } from '../lib/search';
import { getCurrent, getForecast, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, CitySearchState, CurrentWeatherState, ForecastState } from '../types/weather';

export function useWeather() {
  const [searchState, setSearchState] = useState<CitySearchState>({ status: 'idle' });
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<CurrentWeatherState>({ status: 'idle' });
  const [forecast, setForecast] = useState<ForecastState>({ status: 'idle' });
  const searchController = useRef<AbortController | null>(null);
  const searchSequence = useRef(0);
  const currentController = useRef<AbortController | null>(null);
  const forecastController = useRef<AbortController | null>(null);
  const currentSequence = useRef(0);
  const forecastSequence = useRef(0);

  useEffect(() => () => {
    searchSequence.current += 1;
    searchController.current?.abort();
    currentSequence.current += 1;
    forecastSequence.current += 1;
    currentController.current?.abort();
    forecastController.current?.abort();
  }, []);

  async function search(name: string) {
    const normalized = normalizeSearchQuery(name);
    if (normalized === null) return;

    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    const sequence = ++searchSequence.current;
    setQuery(normalized);
    setSearchState({ status: 'loading' });
    try {
      const cities = await searchCities(normalized, controller.signal);
      if (sequence !== searchSequence.current || controller.signal.aborted) return;
      const [first, ...remaining] = cities;
      setSearchState(first ? { status: 'success', data: [first, ...remaining] } : { status: 'empty', reason: 'no-results' });
    } catch (error) {
      if (sequence !== searchSequence.current || controller.signal.aborted) return;
      setSearchState({ status: 'error', error: { kind: error instanceof WeatherServiceError ? error.kind : 'network' } });
    }
  }

  async function loadCurrent(city: City) {
    currentController.current?.abort();
    const controller = new AbortController();
    currentController.current = controller;
    const sequence = ++currentSequence.current;
    setCurrent({ status: 'loading' });
    try {
      const state = await getCurrent(city, controller.signal);
      if (sequence === currentSequence.current && !controller.signal.aborted) setCurrent(state);
    } catch (error) {
      if (sequence === currentSequence.current && !controller.signal.aborted) {
        setCurrent({ status: 'error', error: { kind: error instanceof WeatherServiceError ? error.kind : 'network' } });
      }
    }
  }

  async function loadForecast(city: City) {
    forecastController.current?.abort();
    const controller = new AbortController();
    forecastController.current = controller;
    const sequence = ++forecastSequence.current;
    setForecast({ status: 'loading' });
    try {
      const state = await getForecast(city, controller.signal);
      if (sequence === forecastSequence.current && !controller.signal.aborted) setForecast(state);
    } catch (error) {
      if (sequence === forecastSequence.current && !controller.signal.aborted) {
        setForecast({ status: 'error', error: { kind: error instanceof WeatherServiceError ? error.kind : 'network' } });
      }
    }
  }

  function selectCity(city: City) {
    searchSequence.current += 1;
    searchController.current?.abort();
    setSelectedCity(city);
    setSearchState({ status: 'idle' });
    void loadCurrent(city);
    void loadForecast(city);
  }

  function retrySearch() {
    if (searchState.status === 'error') void search(query);
  }

  function retryCurrent() {
    if (current.status === 'error' && selectedCity) void loadCurrent(selectedCity);
  }

  function retryForecast() {
    if (forecast.status === 'error' && selectedCity) void loadForecast(selectedCity);
  }

  function retry() {
    if (searchState.status === 'error') retrySearch();
    else if (forecast.status === 'error') retryForecast();
    else retryCurrent();
  }

  return { searchState, selectedCity, current, forecast, query, search, selectCity, retry, retrySearch, retryCurrent, retryForecast };
}