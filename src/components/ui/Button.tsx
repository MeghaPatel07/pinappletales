'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'dark'
type Size = 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  /** Full width on small screens, auto from 480px up. */
  block?: boolean
}

type ButtonAsLink = CommonProps & {
  /** Internal route — rendered with next/link. */
  to: string
  href?: never
  onClick?: never
  type?: never
}

type ButtonAsAnchor = CommonProps & {
  /** External or protocol URL (mailto:, tel:, https:). */
  href: string
  to?: never
  onClick?: never
  type?: never
  /** Set for links that leave the site. */
  external?: boolean
}

type ButtonAsButton = CommonProps & {
  to?: never
  href?: never
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand text-ink hover:bg-brand-deep',
  dark: 'bg-ink text-paper hover:bg-ink/90',
  secondary: 'border border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink/5',
  onDark: 'border border-[1.5px] border-paper/60 bg-transparent text-paper hover:bg-paper/10',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-[1rem]',
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, block } = props

  const classes = [
    'btn arrow-move inline-flex items-center justify-center gap-2 rounded-full font-medium',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block ? 'w-full sm:w-auto' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  if ('to' in props && props.to) {
    return (
      <Link href={props.to} className={classes}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const isExternal = props.external ?? /^https?:/.test(props.href)
    return (
      <a
        href={props.href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  const { type = 'button', onClick, disabled } = props as ButtonAsButton
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}
