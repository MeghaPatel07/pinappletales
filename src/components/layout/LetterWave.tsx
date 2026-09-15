'use client'

import { Fragment, useEffect, useRef } from 'react'

/** Cursor-following per-letter wave — desktop pointer only. */
export function LetterWave({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return

    const chars = Array.from(el.querySelectorAll<HTMLElement>('[data-ch]'))
    const RADIUS = 52
    let raf = 0

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        chars.forEach((c) => {
          const r = c.getBoundingClientRect()
          const dx = e.clientX - (r.left + r.width / 2)
          const dy = e.clientY - (r.top + r.height / 2)
          const f = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS)
          c.style.transform = `translate3d(0, ${(-7 * f).toFixed(2)}px, 0) scale(${(1 + 0.04 * f).toFixed(3)})`
        })
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(raf)
      chars.forEach((c) => (c.style.transform = ''))
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [text])

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(w).map((ch, ci) => (
              <span key={ci} data-ch className="inline-block transition-transform duration-[240ms] ease-[var(--ease-organic)] will-change-transform">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
