export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function isCivilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isLocalDateTime(value: string): boolean {
  const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  return parts !== null && isCivilDate(parts[1]) && Number(parts[2]) < 24 &&
    Number(parts[3]) < 60 && (parts[4] === undefined || Number(parts[4]) < 60);
}

export function forecastDates(timeZone: string, now: Date = new Date()): [string, string, string, string, string] {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const first = `${part('year')}-${part('month')}-${part('day')}`;
  const date = new Date(`${first}T00:00:00Z`);
  const dateAt = (offset: number) => new Date(date.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
  return [dateAt(0), dateAt(1), dateAt(2), dateAt(3), dateAt(4)];
}