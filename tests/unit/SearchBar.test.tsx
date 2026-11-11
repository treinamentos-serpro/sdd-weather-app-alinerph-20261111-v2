import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('não pesquisa enquanto digita e envia o texto normalizado pelo botão', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('anuncia entrada inválida e aceita envio válido com Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos dois caracteres');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await user.type(input, '   {Enter}');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '  a  {Enter}');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "  d'Ávila  {Enter}");
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("d'Ávila");
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('desabilita o campo e o botão', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    const button = screen.getByRole('button', { name: 'Pesquisar' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSearch).not.toHaveBeenCalled();
  });
});