import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-md border border-white/10 bg-white/5 p-1 backdrop-blur-md"
    >
      <button
        type="button"
        aria-label="Graus Celsius"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        className={`h-10 w-12 rounded text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${unit === 'celsius' ? 'bg-white text-night-900' : 'text-white hover:bg-white/10'}`}
      >
        °C
      </button>
      <button
        type="button"
        aria-label="Graus Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        className={`h-10 w-12 rounded text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${unit === 'fahrenheit' ? 'bg-white text-night-900' : 'text-white hover:bg-white/10'}`}
      >
        °F
      </button>
    </div>
  );
}