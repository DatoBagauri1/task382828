import { ChevronDown } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export const inputClass =
  'w-full rounded-full border border-neutral-300 bg-white px-4 text-base text-neutral-950 outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-950 hover:bg-neutral-50 focus:border-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/10 sm:text-sm';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('min-h-12', inputClass, className)} {...props} />
));

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('min-h-24 rounded-2xl py-3', inputClass, className)} {...props} />
));

Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, wrapperClassName, ...props }, ref) => (
    <div className={cn('group relative', wrapperClassName)}>
      <select
        ref={ref}
        className={cn('peer min-h-12 appearance-none cursor-pointer pr-11', inputClass, className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 transition duration-200 group-hover:text-neutral-950 peer-focus:rotate-180 peer-focus:text-neutral-950"
      />
    </div>
  ),
);

Select.displayName = 'Select';
