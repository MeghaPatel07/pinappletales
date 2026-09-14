import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

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
  /** Internal route — rendered with react-router's Link. */
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
}

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, block } = props

  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classNames}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const isExternal = props.external ?? /^https?:/.test(props.href)
    return (
      <a
        href={props.href}
        className={classNames}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  const { type = 'button', onClick } = props as ButtonAsButton
  return (
    <button type={type} onClick={onClick} className={classNames}>
      {children}
    </button>
  )
}
