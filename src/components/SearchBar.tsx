import { useId, useState, type FormEvent } from 'react';
import { normalizeSearchQuery } from '../lib/search';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const normalized = normalizeSearchQuery(query);
    if (normalized === null) {
      setInvalid(true);
      return;
    }

    setInvalid(false);
    onSearch(normalized);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full max-w-xl">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-white">
        Cidade
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setInvalid(false);
          }}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          placeholder="Digite uma cidade"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/60 backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md border border-white/10 bg-accent-400 px-5 py-3 font-medium text-night-900 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pesquisar
        </button>
      </div>
      {invalid && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-200">
          Digite pelo menos dois caracteres para pesquisar.
        </p>
      )}
    </form>
  );
}