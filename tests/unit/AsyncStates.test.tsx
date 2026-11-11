import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('estados assíncronos', () => {
  it('anuncia o carregamento com mensagem padrão ou personalizada', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');

    rerender(<LoadingState message="Buscando cidades..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades...');
  });

  it('anuncia a falha e permite nova tentativa por teclado', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível consultar a previsão." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível consultar a previsão.');
    expect(onRetry).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('anuncia título e dica no estado vazio sem oferecer nova tentativa', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Experimente outro nome." />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.getByRole('status')).toHaveTextContent('Experimente outro nome.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});