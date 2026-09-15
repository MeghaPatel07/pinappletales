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
  | 'sparkle'

type IconProps = {
  name: IconName
  size?: number | string
  className?: string
  style?: React.CSSProperties
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
    <path
      fill="currentColor"
      stroke="none"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"
    />
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
  sparkle: (
    <>
      <path
        d="M12 2.5 C 12.8 8, 15.6 10.6, 21.5 12 C 15.6 13.4, 12.8 16, 12 21.5 C 11.2 16, 8.4 13.4, 2.5 12 C 8.4 10.6, 11.2 8, 12 2.5 Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M19 3.5 C 19.3 5.2, 20 5.9, 21.6 6.2 C 20 6.5, 19.3 7.2, 19 8.9 C 18.7 7.2, 18 6.5, 16.4 6.2 C 18 5.9, 18.7 5.2, 19 3.5 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.7"
      />
    </>
  ),
}

export function Icon({ name, size = 20, className, style, title }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
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
