import type { JSX } from 'react'

export type IconName =
  | 'mail'
  | 'phone'
  | 'instagram'
  | 'whatsapp'
  | 'mapPin'
  | 'check'
  | 'arrowRight'
  | 'menu'
  | 'close'
  | 'plus'
  | 'clock'
  | 'globe'
  // Admin-only additions
  | 'search'
  | 'edit'
  | 'trash'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'upload'
  | 'download'
  | 'play'
  | 'calendar'
  | 'image'
  | 'grip'

type IconProps = {
  name: IconName
  size?: number | string
  className?: string
  /** Provide when the icon is the only content of an interactive element. */
  title?: string
}

const paths: Record<IconName, JSX.Element> = {
  mail: (
    <>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.5" />
      <path d="m3.5 7.5 7.34 5.13a2 2 0 0 0 2.32 0L20.5 7.5" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h-.9A2.7 2.7 0 0 0 3 6.4C3.4 13.6 10.4 20.6 17.6 21a2.7 2.7 0 0 0 2.9-2.7v-.9a1.6 1.6 0 0 0-1.2-1.55l-2.6-.65a1.6 1.6 0 0 0-1.6.55l-.8 1a11.6 11.6 0 0 1-5-5l1-.8a1.6 1.6 0 0 0 .55-1.6l-.65-2.6A1.6 1.6 0 0 0 6.6 3.5Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.6 20.4 5 16.6A8.2 8.2 0 1 1 7.9 19.4l-4.3 1Z" />
      <path d="M9.1 8.3c.3-.7.6-.7.9-.7h.6c.2 0 .5 0 .7.6l.8 1.9c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7a7.4 7.4 0 0 0 3.3 2.9c.3.1.5.1.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.3.5.5v.6c0 .5-.4 1.4-1.6 1.6-1 .2-2.3.1-4.6-1a11 11 0 0 1-4.4-4.3c-.5-.9-.9-2-.9-3.1a3 3 0 0 1 1-2.3Z" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10.4c0 5.3-6.3 10.2-7.6 11.2a.7.7 0 0 1-.8 0C10.3 20.6 4 15.7 4 10.4a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.2" r="2.9" />
    </>
  ),
  check: <path d="m4.5 12.6 4.8 4.7L19.5 6.9" />,
  arrowRight: (
    <>
      <path d="M4 12h15.5" />
      <path d="m13.4 5.8 6.2 6.2-6.2 6.2" />
    </>
  ),
  menu: (
    <>
      <path d="M3.5 7.5h17" />
      <path d="M3.5 12.5h17" />
      <path d="M3.5 17.5h17" />
    </>
  ),
  close: (
    <>
      <path d="m5.6 5.6 12.8 12.8" />
      <path d="M18.4 5.6 5.6 18.4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5.2v13.6" />
      <path d="M5.2 12h13.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.9V12l3.4 2.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 12h17.6" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m15.8 15.8 4.2 4.2" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.2L19.4 8.8a2.1 2.1 0 0 0-3-3L5.2 17Z" />
      <path d="m14.9 6.4 2.7 2.7" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.8h15" />
      <path d="M9.4 6.8V5.2a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.6" />
      <path d="M6.6 6.8 7.5 19a1.6 1.6 0 0 0 1.6 1.5h5.8a1.6 1.6 0 0 0 1.6-1.5l.9-12.2" />
      <path d="M10.6 10.4v6.2" />
      <path d="M13.4 10.4v6.2" />
    </>
  ),
  chevronLeft: <path d="m14.5 5.8-6.2 6.2 6.2 6.2" />,
  chevronRight: <path d="m9.5 5.8 6.2 6.2-6.2 6.2" />,
  chevronDown: <path d="m5.8 9.5 6.2 6.2 6.2-6.2" />,
  chevronUp: <path d="m5.8 14.5 6.2-6.2 6.2 6.2" />,
  upload: (
    <>
      <path d="M4 15.5V19a1.6 1.6 0 0 0 1.6 1.6h12.8A1.6 1.6 0 0 0 20 19v-3.5" />
      <path d="M12 3.6v11.2" />
      <path d="m7.6 8 4.4-4.4L16.4 8" />
    </>
  ),
  download: (
    <>
      <path d="M4 15.5V19a1.6 1.6 0 0 0 1.6 1.6h12.8A1.6 1.6 0 0 0 20 19v-3.5" />
      <path d="M12 3.6v11.2" />
      <path d="m7.6 10.4 4.4 4.4 4.4-4.4" />
    </>
  ),
  play: <path d="M8.4 5.6 18 12l-9.6 6.4Z" />,
  calendar: (
    <>
      <rect x="3.8" y="5.4" width="16.4" height="14.8" rx="2.2" />
      <path d="M3.8 10h16.4" />
      <path d="M8.4 3.4v3.4" />
      <path d="M15.6 3.4v3.4" />
    </>
  ),
  image: (
    <>
      <rect x="3.6" y="4.8" width="16.8" height="14.4" rx="2.2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.6 17.4 4.6-4.4 3.4 3 2.8-2.4 4 3.8" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6.5" r="1.1" />
      <circle cx="15" cy="6.5" r="1.1" />
      <circle cx="9" cy="12" r="1.1" />
      <circle cx="15" cy="12" r="1.1" />
      <circle cx="9" cy="17.5" r="1.1" />
      <circle cx="15" cy="17.5" r="1.1" />
    </>
  ),
}

export function Icon({ name, size = 20, className, title }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  )
}
