import { useId } from 'react';
import type { FiveDayForecast, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: FiveDayForecast['days'];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-4 text-lg font-semibold text-white">
        Previsão para cinco dias
      </h2>
      {days.every((day) => day.status === 'unavailable') && (
        <p className="mb-4 text-sm text-white/80">Previsão indisponível para os cinco dias.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day) => (
          <ForecastCard key={day.dateLocal} day={day} unit={unit} />
        ))}
      </div>
    </section>
  );
}