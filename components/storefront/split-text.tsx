"use client"

import React, { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface SplitTextProps {
  children: string
  className?: string
  delay?: number
}

export function SplitText({ children, className, delay = 0 }: SplitTextProps) {
  const elRef = useRef<HTMLDivElement>(null)
  
  // Split text into words manually
  const words = children.split(" ")

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elRef.current?.querySelectorAll(".word-inner") || [],
        {
          y: "100%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration: 1.2,
          stagger: 0.05,
          ease: "power4.out",
          delay: delay,
        }
      )
    }, elRef)

    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={elRef} className={cn("overflow-hidden flex flex-wrap gap-x-[0.25em] gap-y-1", className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden leading-tight">
          <span className="word-inner inline-block origin-top-left">
            {word}
          </span>
        </span>
      ))}
    </div>
  )
}
