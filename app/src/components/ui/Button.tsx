import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'lime' | 'secondary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-600',
  lime: 'bg-lime text-forest hover:bg-lime-300',
  secondary:
    'bg-white text-forest border border-hair hover:bg-panel hover:border-forest-200',
  ghost: 'text-forest-500 hover:bg-panel',
  subtle: 'bg-panel text-forest hover:bg-hair',
  danger: 'bg-rose-soft text-rose-ink hover:brightness-[0.97]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-2xl gap-2',
  lg: 'h-14 px-6 text-[15px] rounded-2xl gap-2.5',
}

const base =
  'inline-flex items-center justify-center font-semibold whitespace-nowrap ' +
  'transition-[transform,background-color,box-shadow,filter,opacity] duration-150 ease-out active:scale-[0.96] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:ring-offset-1 ' +
  'disabled:opacity-40 disabled:pointer-events-none'

export function buttonClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  block?: boolean,
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], block && 'w-full', className)
}

interface CommonProps {
  variant?: Variant
  size?: Size
  block?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

interface ButtonProps
  extends CommonProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, block, className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}

interface ButtonLinkProps extends CommonProps, Omit<LinkProps, 'className'> {
  className?: string
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  block,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, block, className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  )
}
