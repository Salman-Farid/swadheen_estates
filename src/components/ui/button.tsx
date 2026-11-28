import Link from 'next/link'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const styles: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta text-white hover:bg-terracotta-deep shadow-[0_12px_24px_-14px_hsl(var(--terracotta)/.7)]',
  secondary: 'bg-moss text-paper hover:bg-moss/90 dark:bg-paper dark:text-ink dark:hover:bg-paper/90',
  ghost: 'bg-transparent text-ink hover:bg-stone dark:hover:bg-stone/70',
  outline: 'border border-line bg-transparent text-ink hover:border-terracotta hover:text-terracotta',
  dark: 'bg-paper text-ink ring-1 ring-paper/70 hover:bg-gold',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 text-xs',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-sm',
  icon: 'h-11 w-11 p-0',
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45',
      styles[variant],
      sizes[size],
      className,
    )}
    {...props}
  />
))
Button.displayName = 'Button'

export function ButtonLink({
  href,
  className,
  variant = 'primary',
  size = 'md',
  target,
  rel,
  children,
}: {
  href: string
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  target?: string
  rel?: string
  children?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[.98]',
        styles[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </Link>
  )
}
