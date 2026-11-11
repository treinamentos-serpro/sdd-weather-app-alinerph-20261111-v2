import { formatForecastDay } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function conditionIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '?';
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  return (
    <article className="min-w-0 rounded-md border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
      <h3 className="break-words text-sm font-medium">
        <time dateTime={day.dateLocal}>{formatForecastDay(day.dateLocal)}</time>
      </h3>
      {day.status === 'available' ? (
        <>
          <div aria-hidden="true" className="my-3 text-3xl">
            {conditionIcon(day.condition.code)}
          </div>
          <p className="min-h-10 break-words text-sm text-white/80">{day.condition.label}</p>
          <p className="mt-3 break-words text-sm">
            <span className="font-semibold">Máx. {formatTemperature(day.maximumTemperatureC, unit)}</span>
            <span className="mt-1 block text-white/80">Mín. {formatTemperature(day.minimumTemperatureC, unit)}</span>
          </p>
          {day.precipitationProbabilityMax !== undefined && (
            <p className="mt-3 text-sm text-white/80">Chuva: {day.precipitationProbabilityMax}%</p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-white/80">Previsão indisponível</p>
      )}
    </article>
  );
}