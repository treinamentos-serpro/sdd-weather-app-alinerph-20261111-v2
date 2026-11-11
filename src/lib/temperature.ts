import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

export function formatTemperature(temperatureC: number, unit: Unit): string {
  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  return `${temperatureFormatter.format(temperature)} °${unit === 'celsius' ? 'C' : 'F'}`;
}