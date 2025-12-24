"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setShow(false)
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setShow(false)
          // Trigger a custom event to signal main content to animate
          window.dispatchEvent(new CustomEvent("preloaderComplete"))
        }
      })

      tl.to(textRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      })
      .to(textRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.in",
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
      }, "-=0.2")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground"
    >
      <h1
        ref={textRef}
        className="text-3xl md:text-5xl font-light tracking-wide opacity-0 font-display"
      >
        در حال آماده‌سازی استایل…
      </h1>
    </div>
  )
}
