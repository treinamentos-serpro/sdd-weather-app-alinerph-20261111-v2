import { useEffect, useRef, useState } from 'react';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weather';
import type { City, CitySearchState, ForecastState, Unit, WeatherData } from './types/weather';

interface AppProps {
  weatherData?: WeatherData;
}

export default function App({ weatherData = mockWeatherData }: AppProps) {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [search, setSearch] = useState<CitySearchState>({ status: 'idle' });
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [forecast, setForecast] = useState<ForecastState>({ status: 'idle' });
  const cityHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (selectedCity && search.status === 'idle') cityHeadingRef.current?.focus();
  }, [selectedCity, search.status]);

  function handleSearch(query: string) {
    const city = weatherData.city;
    const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
    if (city && normalize(city.name).includes(normalize(query))) {
      setSearch({ status: 'success', data: [city] });
    } else {
      setSearch({ status: 'empty', reason: 'no-results' });
    }
  }

  function selectCity(city: City) {
    setSelectedCity(city);
    setForecast(weatherData.forecast);
    setSearch({ status: 'idle' });
  }

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <header className="border-b border-white/10 bg-night-800">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-accent-400">Weather App</p>
              <h1 className="mt-1 text-2xl font-semibold">Previsão do tempo</h1>
            </div>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <div className="mt-6">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-white/70">Dados de demonstração · Fonte dos dados reais: Open-Meteo</p>

        {search.status === 'loading' && <LoadingState message="Buscando cidades..." />}
        {search.status === 'empty' && (
          <EmptyState title="Nenhuma cidade encontrada" hint="Experimente outro nome." />
        )}
        {search.status === 'error' && (
          <ErrorState message="Não foi possível buscar cidades." onRetry={() => setSearch({ status: 'idle' })} />
        )}
        <p role="status" className="sr-only">
          {search.status === 'success' && `${search.data.length} ${search.data.length === 1 ? 'cidade encontrada' : 'cidades encontradas'}.`}
        </p>
        {search.status === 'success' && (
          <section aria-label="Resultados da pesquisa" className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Selecione uma cidade</h2>
            <ul className="space-y-2">
              {search.data.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full break-words rounded-md border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
                  >
                    <span className="block font-medium">{city.name}</span>
                    {(city.admin1 || city.country) && (
                      <span className="block text-sm text-white/70">{[city.admin1, city.country].filter(Boolean).join(', ')}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!selectedCity ? (
          search.status === 'idle' && <EmptyState title="Nenhuma cidade selecionada" hint="Pesquise uma cidade para consultar a previsão." />
        ) : (
          <div className="mt-6">
            <p className="text-sm font-medium uppercase text-accent-400">Previsão local</p>
            <h2 ref={cityHeadingRef} tabIndex={-1} className="mt-2 break-words text-3xl font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-accent-400">{selectedCity.name}</h2>
            {(selectedCity.admin1 || selectedCity.country) && (
              <p className="mt-1 break-words text-sm text-white/70">{[selectedCity.admin1, selectedCity.country].filter(Boolean).join(', ')}</p>
            )}
            <div className="mt-8">
              {forecast.status === 'idle' && <EmptyState title="Previsão não consultada" hint="Selecione uma cidade para consultar a previsão." />}
              {forecast.status === 'loading' && <LoadingState message="Carregando previsão..." />}
              {forecast.status === 'empty' && <EmptyState title="Previsão indisponível" hint="Não há dados suficientes para esta cidade." />}
              {forecast.status === 'error' && <ErrorState message="Não foi possível consultar a previsão." onRetry={() => setForecast(weatherData.forecast)} />}
              {forecast.status === 'success' && <ForecastList days={forecast.data.days} unit={unit} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}