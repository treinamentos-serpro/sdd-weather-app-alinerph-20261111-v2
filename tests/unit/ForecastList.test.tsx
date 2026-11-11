import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { formatForecastDay } from '../../src/lib/format';
import { formatTemperature } from '../../src/lib/temperature';
import { mockWeatherData } from '../../src/mocks/weather';
import type { FiveDayForecast, ForecastDay } from '../../src/types/weather';

const mockForecast = mockWeatherData.forecast;
if (mockForecast.status !== 'success') throw new Error('Previsão de teste ausente.');

describe('ForecastList', () => {
  it('associa cada lista ao seu próprio título acessível', () => {
    render(
      <>
        <ForecastList days={mockForecast.data.days} unit="celsius" />
        <ForecastList days={mockForecast.data.days} unit="fahrenheit" />
      </>,
    );
    const regions = screen.getAllByRole('region', { name: 'Previsão para cinco dias' });
    expect(regions).toHaveLength(2);
    expect(regions[0].getAttribute('aria-labelledby')).not.toBe(regions[1].getAttribute('aria-labelledby'));
  });

  it('apresenta cinco datas locais, condições, temperaturas e chuva', () => {
    const { rerender } = render(<ForecastList days={mockForecast.data.days} unit="celsius" />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByText(/11\/11\/2026/)).toBeInTheDocument();
    expect(within(cards[4]).getByText(/15\/11\/2026/)).toBeInTheDocument();
    expect(within(cards[0]).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Máx. 27 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Mín. 18 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Chuva: 20%')).toBeInTheDocument();

    rerender(<ForecastList days={mockForecast.data.days} unit="fahrenheit" />);
    expect(within(cards[0]).getByText('Máx. 80,6 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Mín. 64,4 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Chuva: 20%')).toBeInTheDocument();
  });

  it('mantém dias válidos e omite chuva ausente', () => {
    const available: ForecastDay = {
      status: 'available', dateLocal: '2026-11-11', condition: { code: 0, label: 'Céu limpo' },
      minimumTemperatureC: 0, maximumTemperatureC: 20.3,
    };
    const unavailable = (dateLocal: string): ForecastDay => ({
      status: 'unavailable', dateLocal, missingFields: ['condition'],
    });
    const days: FiveDayForecast['days'] = [
      available, unavailable('2026-11-12'), unavailable('2026-11-13'),
      unavailable('2026-11-14'), unavailable('2026-11-15'),
    ];
    render(<ForecastList days={days} unit="fahrenheit" />);
    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Máx. 68,5 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Mín. 32 °F')).toBeInTheDocument();
    expect(within(cards[0]).queryByText(/Chuva:/)).not.toBeInTheDocument();
    expect(within(cards[1]).getByText('Previsão indisponível')).toBeInTheDocument();
    expect(screen.queryByText('Previsão indisponível para os cinco dias.')).not.toBeInTheDocument();
  });

  it('identifica quando todos os dias estão indisponíveis', () => {
    const days = mockForecast.data.days.map((day): ForecastDay => ({
      status: 'unavailable', dateLocal: day.dateLocal, missingFields: ['condition'],
    })) as FiveDayForecast['days'];
    render(<ForecastList days={days} unit="celsius" />);
    expect(screen.getByText('Previsão indisponível para os cinco dias.')).toBeInTheDocument();
    expect(screen.getAllByText('Previsão indisponível')).toHaveLength(5);
  });

  it('exibe probabilidade zero e não atribui ícone meteorológico a código desconhecido', () => {
    const [first, second, third, fourth, fifth] = mockForecast.data.days;
    const unknown: ForecastDay = {
      status: 'available', dateLocal: first.dateLocal,
      condition: { code: 52, label: 'Condição desconhecida' },
      minimumTemperatureC: 10, maximumTemperatureC: 20, precipitationProbabilityMax: 0,
    };
    render(<ForecastList days={[unknown, second, third, fourth, fifth]} unit="celsius" />);
    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByText('Chuva: 0%')).toBeInTheDocument();
    expect(within(card).getByText('Condição desconhecida')).toBeInTheDocument();
    expect(within(card).getByText('?')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('formatação da previsão', () => {
  it('mantém a data civil e formata temperaturas sem alterar o valor original', () => {
    expect(formatForecastDay('2026-11-11')).toMatch(/11\/11\/2026/);
    expect(formatTemperature(0, 'fahrenheit')).toBe('32 °F');
    expect(formatTemperature(20.3, 'fahrenheit')).toBe('68,5 °F');
    expect(formatTemperature(20.3, 'celsius')).toBe('20,3 °C');
    expect(formatTemperature(20.3, 'fahrenheit')).toBe('68,5 °F');
    expect(formatTemperature(20.3, 'celsius')).toBe('20,3 °C');
  });
});