'use client'

import { useEffect, useRef, useState } from 'react'
import MatrixVisualization from './MatrixVisualization'
import { COLOR_WINDOW_DAYS } from '@/lib/displayPolicy'

// Quiz-page "Curious? See where others stand!" button + lightbox.
// The button is a hand-drawn miniature of the matrix (approved icon design,
// 2026-08-25) with a softly pulsing "just landed" dot; clicking it opens the
// live community matrix in observer mode (no user dot) so visitors can explore
// results without taking the survey.
export default function MatrixLightbox() {
  const [isOpen, setIsOpen] = useState(false)
  const launchButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    setIsOpen(false)
    launchButtonRef.current?.focus()
  }

  // While open: close on Escape, lock body scroll, move focus into the dialog
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={launchButtonRef}
        type="button"
        className="matrix-lightbox-button"
        aria-haspopup="dialog"
        aria-label="See where others stand — open the live matrix"
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="matrix-lightbox-thumb"
          width="96"
          height="70"
          viewBox="0 0 96 70"
          aria-hidden="true"
        >
          <rect width="96" height="70" fill="white" />
          <line x1="6" y1="35" x2="90" y2="35" stroke="#2563eb" strokeWidth="2" />
          <line x1="48" y1="5" x2="48" y2="65" stroke="#2563eb" strokeWidth="2" />
          <circle cx="26" cy="18" r="4" fill="#2a9d8f" opacity="0.85" />
          <circle cx="70" cy="50" r="4" fill="#7b2cbf" opacity="0.85" />
          <circle cx="36" cy="52" r="4" fill="#0077b6" opacity="0.85" />
          <circle cx="58" cy="44" r="3" fill="#888888" opacity="0.35" />
          <circle cx="78" cy="22" r="3" fill="#888888" opacity="0.35" />
          {/* pulsing "just landed" dot */}
          <circle cx="64" cy="17" r="5" fill="#e63946" opacity="0.9" />
          <circle className="pulse-ring" cx="64" cy="17" r="5" fill="none" stroke="#e63946" strokeWidth="1.5">
            <animate attributeName="r" values="5;11" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span className="matrix-lightbox-label">
          Curious? See where<br />others stand!
        </span>
      </button>

      {isOpen && (
        <div
          className="matrix-lightbox-backdrop"
          onClick={close}
          role="presentation"
        >
          <div
            className="matrix-lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Live AI Positioning Matrix"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="matrix-lightbox-close"
              aria-label="Close matrix view"
              onClick={close}
            >
              ×
            </button>
            <MatrixVisualization showOtherDots />
            <p className="matrix-lightbox-caption">
              Live view — colored dots are stances from the last {COLOR_WINDOW_DAYS} days;
              gray dots are older.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
