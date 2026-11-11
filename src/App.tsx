import { useEffect, useRef, useState } from 'react';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit, WeatherError } from './types/weather';

const errorMessages: Record<WeatherError['kind'], string> = {
  timeout: 'A requisição demorou demais.',
  network: 'Falha de rede.',
  'rate-limit': 'Limite de consultas atingido.',
  http: 'Não foi possível concluir a consulta.',
  'invalid-response': 'A resposta recebida é inválida.',
};

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { searchState, selectedCity, forecast, search, selectCity, retrySearch, retryForecast } = useWeather();
  const cityHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (selectedCity && searchState.status === 'idle') cityHeadingRef.current?.focus();
  }, [selectedCity, searchState.status]);

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
            <SearchBar onSearch={search} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-white/70">Fonte: Open-Meteo</p>

        {searchState.status === 'loading' && <LoadingState message="Buscando cidades..." />}
        {searchState.status === 'empty' && (
          <EmptyState title="Nenhuma cidade encontrada" hint="Experimente outro nome." />
        )}
        {searchState.status === 'error' && (
          <ErrorState message={errorMessages[searchState.error.kind]} onRetry={retrySearch} />
        )}
        <p role="status" className="sr-only">
          {searchState.status === 'success' && `${searchState.data.length} ${searchState.data.length === 1 ? 'cidade encontrada' : 'cidades encontradas'}.`}
        </p>
        {searchState.status === 'success' && (
          <section aria-label="Resultados da pesquisa" className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Selecione uma cidade</h2>
            <ul className="space-y-2">
              {searchState.data.map((city) => (
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
          searchState.status === 'idle' && <EmptyState title="Nenhuma cidade selecionada" hint="Pesquise uma cidade para consultar a previsão." />
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
              {forecast.status === 'error' && <ErrorState message={errorMessages[forecast.error.kind]} onRetry={retryForecast} />}
              {forecast.status === 'success' && <ForecastList days={forecast.data.days} unit={unit} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}