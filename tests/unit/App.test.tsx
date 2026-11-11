import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import type { ForecastState } from '../../src/types/weather';

describe('App com dados de demonstração', () => {
  it('exige seleção explícita e alterna temperaturas sem consultar a rede', async () => {
    const user = userEvent.setup();
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<App />);

    expect(screen.getByText('Nenhuma cidade selecionada')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Sao Paulo{Enter}');
    expect(screen.getByText('1 cidade encontrada.')).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('heading', { name: 'Previsão para cinco dias' })).not.toBeInTheDocument();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /São Paulo/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
    const cards = screen.getAllByRole('article');
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
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it('informa quando a cidade não está no mock', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Recife{Enter}');
    expect(screen.getByText('Nenhuma cidade encontrada')).toBeInTheDocument();
  });

  it.each([
    [{ status: 'idle' }, 'Previsão não consultada'],
    [{ status: 'loading' }, 'Carregando previsão...'],
    [{ status: 'empty', reason: 'missing-required-data' }, 'Previsão indisponível'],
    [{ status: 'error', error: { kind: 'network' } }, 'Não foi possível consultar a previsão.'],
  ] satisfies Array<[ForecastState, string]>)(
    'apresenta o estado da previsão %s',
    async (forecast, message) => {
      const user = userEvent.setup();
      render(<App weatherData={{ ...mockWeatherData, forecast }} />);
      await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
      await user.click(screen.getByRole('button', { name: /São Paulo/ }));
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Previsão para cinco dias' })).not.toBeInTheDocument();
    },
  );
});