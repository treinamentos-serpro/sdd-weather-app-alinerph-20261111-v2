import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

describe('UnitToggle', () => {
  it('identifica a unidade recebida e informa a escolha por clique', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Graus Celsius', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Graus Fahrenheit', pressed: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Graus Fahrenheit', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Graus Celsius', pressed: false })).toBeInTheDocument();
  });

  it('permite escolher as duas unidades pelo teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');
      return <UnitToggle unit={unit} onChange={(nextUnit) => { onChange(nextUnit); setUnit(nextUnit); }} />;
    }

    render(<ControlledToggle />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Graus Celsius' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Graus Fahrenheit' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    expect(screen.getByRole('button', { name: 'Graus Fahrenheit', pressed: true })).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(screen.getByRole('button', { name: 'Graus Celsius', pressed: true })).toHaveFocus();
  });
});