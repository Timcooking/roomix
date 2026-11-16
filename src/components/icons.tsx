import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = ({ size = 24, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  ...rest,
})

/** Roomix mark: a house with a heart cut out */
export const LogoMark = ({ gradient = true, ...p }: P & { gradient?: boolean }) => (
  <svg {...base(p)}>
    {gradient && (
      <defs>
        <linearGradient id="rmx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-1)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
    )}
    <path
      fillRule="evenodd"
      fill={gradient ? 'url(#rmx-g)' : 'currentColor'}
      d="M10.6 2.55a2.3 2.3 0 0 1 2.8 0l7.2 5.6c.56.44.9 1.12.9 1.83v9.27A2.75 2.75 0 0 1 18.75 22H5.25A2.75 2.75 0 0 1 2.5 19.25V9.98c0-.71.34-1.39.9-1.83l7.2-5.6ZM12 18.7c.2 0 4.6-2.7 4.6-5.8a2.45 2.45 0 0 0-4.6-1.2 2.45 2.45 0 0 0-4.6 1.2c0 3.1 4.4 5.8 4.6 5.8Z"
    />
  </svg>
)

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" fill="none" />
  </svg>
)

export const IconHeart = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

export const IconStar = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth={1.2} d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
  </svg>
)

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth={1} d="M13.5 2L4.5 13.5h6.5L10 22l9.5-12h-6.6L13.5 2z" />
  </svg>
)

export const IconRewind = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 5V2.2a.6.6 0 0 0-1-.45L6.6 5.6a.6.6 0 0 0 0 .9L11 10.3a.6.6 0 0 0 1-.45V7.2a5.8 5.8 0 1 1-5.8 5.8.9.9 0 0 0-.9-.9H4.6a.9.9 0 0 0-.9.9A8.3 8.3 0 1 0 12 5z" />
  </svg>
)

export const IconInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.95)" />
    <path d="M12 16.5V8.2M8.4 11.6 12 8l3.6 3.6" stroke="#111" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const IconDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 6v12M6.5 12.5 12 18l5.5-5.5" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const IconBack = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1-.2 1.3-.8 2.6-1.8 3.6 2 0 3.8-.7 5.1-1.7 1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" />
  </svg>
)

export const IconPerson = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 12a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2zm0 1.9c-4.6 0-8.4 2.4-8.4 5.4v.9c0 .7.6 1.3 1.3 1.3h14.2c.7 0 1.3-.6 1.3-1.3v-.9c0-3-3.8-5.4-8.4-5.4z" />
  </svg>
)

/** two keys / building — used for the shared rooms tab */
export const IconRooms = (p: P) => (
  <svg {...base(p)}>
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M5 2.5h9A1.5 1.5 0 0 1 15.5 4v4.5H19A1.5 1.5 0 0 1 20.5 10v11.5h-6v-4h-5v4h-6V4A1.5 1.5 0 0 1 5 2.5ZM6.5 6v2h2V6h-2Zm4 0v2h2V6h-2Zm-4 4v2h2v-2h-2Zm4 0v2h2v-2h-2Zm5 0v2h2v-2h-2Zm-9 4v2h2v-2h-2Zm9 0v2h2v-2h-2Z"
    />
  </svg>
)

export const IconSliders = (p: P) => (
  <svg {...base(p)}>
    <g stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" fill="none">
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </g>
  </svg>
)

export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-1.7 1.7a.7.7 0 0 0 .5 1.2h16.4a.7.7 0 0 0 .5-1.2L19 16z" />
  </svg>
)

export const IconSend = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M3.4 20.4 21 12.9a1 1 0 0 0 0-1.8L3.4 3.6a.7.7 0 0 0-1 .8L4 10.5l9 1.5-9 1.5-1.6 6.1a.7.7 0 0 0 1 .8z" />
  </svg>
)

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const IconVerified = (p: P) => (
  <svg {...base(p)}>
    <path fill="#1d9bf0" d="M12 1.8l2.4 1.7 2.9-.2.9 2.8 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-.9 2.8-2.9-.2L12 19.4l-2.4-1.7-2.9.2-.9-2.8-2.4-1.7.9-2.8-.9-2.8 2.4-1.7.9-2.8 2.9.2z" transform="translate(0 1.4)" />
    <path d="M8.3 12.6l2.5 2.5 5-5.1" stroke="#fff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
)

export const IconBag = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M9 3.5A1.5 1.5 0 0 0 7.5 5v1.5H5A2.5 2.5 0 0 0 2.5 9v9A2.5 2.5 0 0 0 5 20.5h14a2.5 2.5 0 0 0 2.5-2.5V9A2.5 2.5 0 0 0 19 6.5h-2.5V5A1.5 1.5 0 0 0 15 3.5H9zm0 1.8h6v1.2H9V5.3z" />
  </svg>
)

export const IconTrain = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 2c-4 0-7 .5-7 4v9.5A3.5 3.5 0 0 0 8.5 19L7 20.5v.5h2.2l2-2h1.6l2 2H17v-.5L15.5 19a3.5 3.5 0 0 0 3.5-3.5V6c0-3.5-3-4-7-4zM8.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM17 11H7V6h10v5z" />
  </svg>
)

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2.5 2.5 0 0 1 2.5 2.5v12A2.5 2.5 0 0 1 19 21H5a2.5 2.5 0 0 1-2.5-2.5v-12A2.5 2.5 0 0 1 5 4h1V3a1 1 0 0 1 1-1zM4.5 9.5v9c0 .3.2.5.5.5h14c.3 0 .5-.2.5-.5v-9h-15z" />
  </svg>
)

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M10.6 2.6a2.2 2.2 0 0 1 2.8 0l7.3 5.8c.5.4.8 1 .8 1.7v9.4a2 2 0 0 1-2 2h-4.3v-6h-6.4v6H4.5a2 2 0 0 1-2-2v-9.4c0-.7.3-1.3.8-1.7l7.3-5.8z" />
  </svg>
)

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <g fill="none" stroke="currentColor" strokeWidth={1.9}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M2.8 12h18.4M12 2.8c2.6 2.6 3.8 5.7 3.8 9.2s-1.2 6.6-3.8 9.2c-2.6-2.6-3.8-5.7-3.8-9.2S9.4 5.4 12 2.8z" />
    </g>
  </svg>
)
