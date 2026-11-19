import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-black font-semibold hover:brightness-110',
  secondary: 'bg-surface-2 text-text border border-border hover:border-accent/60',
  ghost: 'text-muted hover:text-text hover:bg-surface-2',
  danger: 'bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  active?: boolean;
}

export function Button({ variant = 'secondary', active, className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition disabled:opacity-50 ${VARIANTS[variant]} ${
        active ? '!border-accent !text-accent' : ''
      } ${className}`}
      {...rest}
    />
  );
}
