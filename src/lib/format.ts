const forecastDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatForecastDay(dateLocal: string): string {
  return forecastDateFormatter.format(new Date(`${dateLocal}T00:00:00Z`));
}