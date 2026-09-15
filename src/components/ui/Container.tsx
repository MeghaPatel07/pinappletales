import type { ElementType, ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  /** `narrow` constrains to a comfortable reading measure. */
  width?: 'default' | 'narrow' | 'wide'
  as?: ElementType
  className?: string
}

const WIDTH_CLASSES: Record<NonNullable<ContainerProps['width']>, string> = {
  default: 'container-1200',
  narrow: 'mx-auto w-full max-w-3xl px-6',
  wide: 'mx-auto w-full max-w-[1400px] px-6',
}

export function Container({
  children,
  width = 'default',
  as: Tag = 'div',
  className,
}: ContainerProps) {
  return (
    <Tag className={[WIDTH_CLASSES[width], className].filter(Boolean).join(' ')}>{children}</Tag>
  )
}
