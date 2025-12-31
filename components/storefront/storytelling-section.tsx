"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { fa } from "@/lib/copy/fa"

gsap.registerPlugin(ScrollTrigger)

type StoryStep = {
  title: string
  body: string
  image: string
  kicker?: string
}

type StorytellingSectionProps = {
  steps: readonly StoryStep[]
}

export function StorytellingSection({ steps }: StorytellingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const desktopQuery = window.matchMedia("(min-width: 768px)")

    const update = () => {
      setMotionEnabled(!reducedQuery.matches)
      setIsDesktop(desktopQuery.matches)
    }

    const subscribe = (query: MediaQueryList) => {
      if (query.addEventListener) {
        query.addEventListener("change", update)
        return () => query.removeEventListener("change", update)
      }
      query.addListener(update)
      return () => query.removeListener(update)
    }

    update()
    const unsubscribeReduced = subscribe(reducedQuery)
    const unsubscribeDesktop = subscribe(desktopQuery)

    return () => {
      unsubscribeReduced()
      unsubscribeDesktop()
    }
  }, [])

  useEffect(() => {
    if (!motionEnabled || !isDesktop || !containerRef.current) return

    const ctx = gsap.context(() => {
      const stepNodes = gsap.utils.toArray<HTMLElement>(".story-step")
      const imageNodes = gsap.utils.toArray<HTMLElement>(".story-image")

      gsap.set(stepNodes, { opacity: 0, y: 24 })
      gsap.set(imageNodes, { opacity: 0, scale: 1.04 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${Math.max(stepNodes.length, 1) * 120}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      stepNodes.forEach((step, index) => {
        const at = index * 1.2
        const image = imageNodes[index]

        tl.to(
          step,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          at
        )

        if (image) {
          tl.to(
            image,
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
            },
            at
          )
        }

        if (index < stepNodes.length - 1) {
          tl.to(
            step,
            {
              opacity: 0,
              y: -18,
              duration: 0.5,
              ease: "power2.inOut",
            },
            at + 0.9
          )

          if (image) {
            tl.to(
              image,
              {
                opacity: 0,
                scale: 1.02,
                duration: 0.5,
                ease: "power2.inOut",
              },
              at + 0.9
            )
          }
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isDesktop, motionEnabled, steps.length])

  const stackedLayout = useMemo(() => !motionEnabled || !isDesktop, [motionEnabled, isDesktop])

  if (stackedLayout) {
    return (
      <section className="section-spacing bg-gradient-to-b from-background via-muted/20 to-background">
        <PageContainer>
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {fa.store.storyKicker}
            </p>
            <h2 className="text-hero font-bold mt-4">{fa.store.storyHeadline}</h2>
          </div>
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={`${step.title}-${index}`}
                className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center"
              >
                <div>
                  {step.kicker ? (
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
                      {step.kicker}
                    </p>
                  ) : null}
                  <h3 className="text-title font-bold mb-4">{step.title}</h3>
                  <p className="text-body text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/40 shadow-lg">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="absolute inset-0 grain-texture" />
      <PageContainer className="py-16 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="relative min-h-[28rem]">
            {steps.map((step, index) => (
              <div
                key={`${step.title}-${index}`}
                className={cn(
                  "story-step absolute inset-0 flex items-center",
                  index === 0 ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="max-w-xl">
                  {step.kicker ? (
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
                      {step.kicker}
                    </p>
                  ) : null}
                  <h3 className="text-hero font-bold mb-6">{step.title}</h3>
                  <p className="text-body text-muted-foreground leading-relaxed text-lg">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-border/50 shadow-xl bg-muted/30">
            {steps.map((step) => (
              <div key={step.image} className="story-image absolute inset-0">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
