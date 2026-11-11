import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import { getCurrent, getForecast, searchCities, WeatherServiceError } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, getCurrent: vi.fn(), getForecast: vi.fn(), searchCities: vi.fn() };
});

const city = mockWeatherData.city;
const forecast = mockWeatherData.forecast;
if (!city || forecast.status !== 'success') throw new Error('Dados de teste ausentes.');

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([city]);
  vi.mocked(getCurrent).mockResolvedValue({ status: 'empty', reason: 'missing-required-data' });
  vi.mocked(getForecast).mockResolvedValue(forecast);
});

describe('App', () => {
  it('exige seleção explícita e alterna temperaturas sem novas consultas', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Nenhuma cidade selecionada')).toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
    expect(await screen.findByText('1 cidade encontrada.')).toHaveAttribute('role', 'status');
    expect(getForecast).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Previsão para cinco dias' })).not.toBeInTheDocument();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /São Paulo/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toHaveFocus();
    const cards = await screen.findAllByRole('article');
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByText('Máx. 27 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));
    expect(within(cards[0]).getByText('Máx. 80,6 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Chuva: 20%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Graus Celsius' }));
    expect(within(cards[0]).getByText('Máx. 27 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Mín. 18 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));
    expect(within(cards[0]).getByText('Máx. 80,6 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Chuva: 20%')).toBeInTheDocument();
    expect(getForecast).toHaveBeenCalledTimes(1);
    expect(getCurrent).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Fonte: Open-Meteo')).toBeInTheDocument();
  });

  it('informa quando nenhuma cidade é encontrada', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Recife{Enter}');
    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
  });

  it('repete a busca que falhou mesmo após editar o campo', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('network')).mockResolvedValueOnce([city]);
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.clear(input);
    await user.type(input, 'Recife');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('button', { name: /São Paulo/ })).toBeInTheDocument();
    expect(vi.mocked(searchCities).mock.calls[1][0]).toBe('São Paulo');
  });

  it('apresenta erro de previsão e repete apenas a operação afetada', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(new WeatherServiceError('timeout')).mockResolvedValueOnce(forecast);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('A requisição demorou demais.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findAllByRole('article')).toHaveLength(5);
    expect(getForecast).toHaveBeenCalledTimes(2);
    expect(getCurrent).toHaveBeenCalledTimes(1);
  });

  it('apresenta carregamento e indisponibilidade da previsão', async () => {
    let resolveForecast: ((value: Awaited<ReturnType<typeof getForecast>>) => void) | undefined;
    vi.mocked(getForecast).mockImplementation(() => new Promise((resolve) => { resolveForecast = resolve; }));
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(screen.getByText('Carregando previsão...')).toBeInTheDocument();
    await act(async () => { resolveForecast?.({ status: 'empty', reason: 'missing-required-data' }); });
    expect(await screen.findByText('Previsão indisponível')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });
});