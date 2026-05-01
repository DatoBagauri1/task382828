import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
>;

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-black text-white shadow-soft hover:bg-neutral-800',
  secondary:
    'bg-white text-black ring-1 ring-neutral-300 hover:bg-neutral-100',
  ghost:
    'bg-transparent text-black ring-1 ring-neutral-300 hover:bg-neutral-100',
  danger:
    'bg-neutral-900 text-white hover:bg-black',
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'min-h-10 px-3.5 py-2 text-sm sm:px-4',
  md: 'min-h-11 px-4 py-2.5 text-sm sm:px-5 sm:text-[15px]',
  lg: 'min-h-12 px-5 py-3 text-sm sm:px-6 sm:text-base',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center rounded-full text-center font-semibold leading-tight transition duration-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
      variantClass[variant],
      sizeClass[size],
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
