import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { forecastDates } from '../../src/lib/date-format';

afterEach(() => vi.unstubAllGlobals());

describe('integração da aplicação com Open-Meteo', () => {
  it('pesquisa e apresenta a previsão mesmo quando a consulta atual falha', async () => {
    const fetch = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.hostname === 'geocoding-api.open-meteo.com') {
        return new Response(JSON.stringify({ results: [{ id: 1, name: 'Recife', latitude: -8, longitude: -35, admin1: 'Pernambuco', country: 'Brasil' }] }));
      }
      if (url.searchParams.has('current')) return new Response('', { status: 500 });
      return new Response(JSON.stringify({
        timezone: 'America/Recife',
        daily: {
          time: forecastDates('America/Recife'),
          weather_code: [0, 0, 0, 0, 0],
          temperature_2m_min: [20, 20, 20, 20, 20],
          temperature_2m_max: [30, 30, 30, 30, 30],
        },
      }));
    });
    vi.stubGlobal('fetch', fetch);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Recife{Enter}');
    expect(await screen.findByRole('button', { name: /Recife.*Pernambuco.*Brasil/ })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }));
    const cards = await screen.findAllByRole('article');
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByText('Máx. 30 °C')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});