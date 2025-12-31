"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion"
import { ShoppingBag, Truck, Shield, Sparkles } from "lucide-react"
import { Container } from "@/components/ui/container"
import { GlassCard } from "@/components/ui/glass-card"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { SectionHeader } from "@/components/ui/section-header"
import { FeatureCard } from "@/components/storefront/feature-card"
import { AnimatedCounter } from "@/components/storefront/animated-counter"
import { ProductPreviewCard } from "@/components/storefront/product-preview-card"
import { fa } from "@/lib/copy/fa"

type StoreLandingPageProps = {
  heroHeadline: string
  heroSubheadline: string
}

const heroImages = [
  "/placeholders/N1.png",
  "/placeholders/N2.png",
  "/placeholders/N3.png",
]

const easeOut = [0.22, 0.61, 0.36, 1] as const

export function StoreLandingPageClient({
  heroHeadline,
  heroSubheadline,
}: StoreLandingPageProps) {
  const prefersReducedMotion = useReducedMotion()
  const [activeHero, setActiveHero] = useState(0)
  const [spotlightEnabled, setSpotlightEnabled] = useState(false)
  const pageRef = useRef<HTMLDivElement | null>(null)
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const interval = window.setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroImages.length)
    }, 6500)
    return () => window.clearInterval(interval)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) {
      setSpotlightEnabled(false)
      return
    }
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const updateEnabled = () => setSpotlightEnabled(mediaQuery.matches)
    updateEnabled()
    mediaQuery.addEventListener("change", updateEnabled)
    return () => mediaQuery.removeEventListener("change", updateEnabled)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!spotlightEnabled || !pageRef.current || !spotlightRef.current) return
    let frame = 0
    let latestX = 0
    let latestY = 0
    const handleMove = (event: MouseEvent) => {
      latestX = event.clientX
      latestY = event.clientY
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const bounds = pageRef.current?.getBoundingClientRect()
        if (!bounds || !spotlightRef.current) return
        const x = Math.max(0, Math.min(100, ((latestX - bounds.left) / bounds.width) * 100))
        const y = Math.max(0, Math.min(100, ((latestY - bounds.top) / bounds.height) * 100))
        spotlightRef.current.style.setProperty("--spotlight-x", `${x}%`)
        spotlightRef.current.style.setProperty("--spotlight-y", `${y}%`)
      })
    }
    const node = pageRef.current
    node.addEventListener("mousemove", handleMove, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      node.removeEventListener("mousemove", handleMove)
    }
  }, [spotlightEnabled])

  const heroItemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 22 },
      show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.9,
          ease: easeOut,
          delay: prefersReducedMotion ? 0 : 0.12 * index,
        },
      }),
    }),
    [prefersReducedMotion]
  )

  const heroImageVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 20,
        scale: prefersReducedMotion ? 1 : 0.97,
      },
      show: (index = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : 1,
          ease: easeOut,
          delay: prefersReducedMotion ? 0 : 0.12 * index,
        },
      }),
    }),
    [prefersReducedMotion]
  )

  const sectionReveal = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 26 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.95, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  )

  const stats = fa.store.stats.map((stat) => ({
    label: stat.label,
    value: stat.value,
  }))

  const previewProducts = [
    {
      title: fa.store.featuredTitle,
      image: "/placeholders/N1.png",
      price: 2450000,
    },
    {
      title: fa.store.heroTitle,
      image: "/placeholders/N2.png",
      price: 1890000,
    },
    {
      title: fa.store.finalTitle,
      image: "/placeholders/N3.png",
      price: 2680000,
    },
    {
      title: fa.store.heroSubtitle,
      image: "/placeholders/N2.png",
      price: 2190000,
    },
  ]

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div ref={pageRef} className="relative min-h-screen" dir="rtl">
          {spotlightEnabled ? (
            <div
              ref={spotlightRef}
              className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(620px circle at var(--spotlight-x, 50%) var(--spotlight-y, 20%), hsl(var(--primary) / 0.16), transparent 60%)",
              }}
            />
          ) : null}
          <m.section
            className="relative overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background"
            initial="hidden"
            animate="show"
          >
            <div className="absolute inset-0 grain-texture" />
            <Container className="relative z-10 grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.05fr]">
              <m.div
                className="order-1 lg:order-2"
                variants={heroImageVariants}
                custom={4}
              >
                <div className="relative mx-auto max-w-md sm:max-w-lg">
                  <GlassCard className="relative overflow-hidden rounded-[2.25rem] border border-border/50 bg-white/70 shadow-xl">
                    <div className="relative aspect-[4/5] px-6 py-8">
                      <AnimatePresence mode="wait">
                        <m.div
                          key={heroImages[activeHero]}
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{
                            opacity: 0,
                            y: prefersReducedMotion ? 0 : 16,
                            scale: prefersReducedMotion ? 1 : 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              duration: prefersReducedMotion ? 0 : 1.2,
                              ease: easeOut,
                            },
                          }}
                          exit={{
                            opacity: 0,
                            y: prefersReducedMotion ? 0 : -12,
                            scale: prefersReducedMotion ? 1 : 0.99,
                            transition: {
                              duration: prefersReducedMotion ? 0 : 0.8,
                              ease: easeOut,
                            },
                          }}
                        >
                          <Image
                            src={heroImages[activeHero]}
                            alt={fa.brand.name}
                            width={900}
                            height={1125}
                            quality={100}
                            className="h-full w-full object-contain"
                            priority={activeHero === 0}
                            sizes="(max-width: 1024px) 90vw, 40vw"
                          />
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </GlassCard>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {heroImages.map((_, index) => (
                      <span
                        key={`hero-dot-${index}`}
                        className={
                          index === activeHero
                            ? "h-1.5 w-6 rounded-full bg-primary/70 transition-all duration-500"
                            : "h-1.5 w-3 rounded-full bg-border"
                        }
                      />
                    ))}
                  </div>
                </div>
              </m.div>

              <m.div
                className="order-2 text-center lg:order-1 lg:text-right"
              >
                <m.div
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                  variants={heroItemVariants}
                  custom={0}
                >
                  {fa.store.heroSubtle}
                </m.div>
                <m.h1
                  className="mt-4 text-display font-bold leading-tight"
                  variants={heroItemVariants}
                  custom={1}
                >
                  <span className="bg-gradient-to-l from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                    {fa.store.heroTitle}
                  </span>
                </m.h1>
                <m.p
                  className="mt-6 text-subtitle text-muted-foreground leading-relaxed"
                  variants={heroItemVariants}
                  custom={2}
                >
                  <span className="block text-foreground">{heroHeadline}</span>
                  <span className="block text-foreground/70">{heroSubheadline}</span>
                </m.p>
                <m.div
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
                  variants={heroItemVariants}
                  custom={3}
                >
                  <m.div
                    className="inline-flex rounded-2xl"
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            boxShadow:
                              "0 18px 40px -22px hsl(var(--primary) / 0.55)",
                          }
                    }
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                  >
                    <LuxuryButton asChild tone="primary">
                      <Link href="/store/products">{fa.store.heroPrimaryCta}</Link>
                    </LuxuryButton>
                  </m.div>
                  <m.div
                    className="inline-flex rounded-2xl"
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            boxShadow:
                              "0 16px 35px -24px hsl(var(--primary) / 0.35)",
                          }
                    }
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                  >
                    <LuxuryButton asChild tone="ghost">
                      <Link href="/store/categories">{fa.store.heroSecondaryCta}</Link>
                    </LuxuryButton>
                  </m.div>
                </m.div>
                <m.div
                  className="mt-10 flex items-center gap-3 text-xs text-muted-foreground"
                  variants={heroItemVariants}
                  custom={5}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span>{fa.store.heroSubtitle}</span>
                </m.div>
              </m.div>
            </Container>
          </m.section>

          <m.section
            className="section-spacing bg-background"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionReveal}
          >
            <Container>
              <SectionHeader
                title={fa.store.featuredTitle}
                subtitle={fa.store.heroSubtitle}
                className="mb-12"
              />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
                <m.div
                  variants={heroItemVariants}
                  custom={0}
                  whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <FeatureCard
                    title={fa.store.featureCards[0].title}
                    body={fa.store.featureCards[0].body}
                    icon={<ShoppingBag className="h-10 w-10 text-primary" />}
                    className="transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30"
                  />
                </m.div>
                <m.div
                  variants={heroItemVariants}
                  custom={1}
                  whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <FeatureCard
                    title={fa.store.featureCards[1].title}
                    body={fa.store.featureCards[1].body}
                    icon={<Truck className="h-10 w-10 text-primary" />}
                    className="transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30"
                  />
                </m.div>
                <m.div
                  variants={heroItemVariants}
                  custom={2}
                  whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <FeatureCard
                    title={fa.store.featureCards[2].title}
                    body={fa.store.featureCards[2].body}
                    icon={<Shield className="h-10 w-10 text-primary" />}
                    className="transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30"
                  />
                </m.div>
              </div>
            </Container>
          </m.section>

          <m.section
            className="section-spacing bg-muted/20"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={sectionReveal}
          >
            <Container>
              <SectionHeader
                title={fa.store.featuredTitle}
                subtitle={fa.store.featuredSubtitle}
                actions={
                  <LuxuryButton asChild tone="ghost" className="hidden lg:inline-flex">
                    <Link href="/store/products?featured=true">{fa.store.featuredCta}</Link>
                  </LuxuryButton>
                }
                className="mb-12"
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {previewProducts.map((product, index) => (
                  <m.div
                    key={`${product.title}-${index}`}
                    variants={heroItemVariants}
                    custom={index}
                    whileHover={prefersReducedMotion ? undefined : { y: -10 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                  >
                    <ProductPreviewCard
                      {...product}
                      className="transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30"
                    />
                  </m.div>
                ))}
              </div>
            </Container>
          </m.section>

          <m.section
            className="section-spacing bg-background"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={sectionReveal}
          >
            <Container>
              <div className="grid grid-cols-2 gap-10 text-center md:grid-cols-4 lg:gap-16">
                {stats.map((stat) => (
                  <m.div key={stat.label} variants={heroItemVariants}>
                    <AnimatedCounter
                      value={stat.value}
                      className="block text-hero font-bold text-primary mb-3 persian-number"
                    />
                    <div className="text-caption text-muted-foreground">{stat.label}</div>
                  </m.div>
                ))}
              </div>
            </Container>
          </m.section>

          <m.section
            className="section-spacing bg-gradient-to-l from-primary/5 via-primary/3 to-background"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionReveal}
          >
            <Container className="text-center">
              <m.h2
                className="text-hero font-bold mb-6"
                variants={heroItemVariants}
                custom={0}
              >
                {fa.store.finalTitle}
              </m.h2>
              <m.p
                className="text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                variants={heroItemVariants}
                custom={1}
              >
                {fa.store.finalSubtitle}
              </m.p>
              <m.div
                variants={heroItemVariants}
                custom={2}
                animate={{
                  boxShadow: prefersReducedMotion
                    ? "none"
                    : [
                        "0 0 0 0 rgba(0,0,0,0)",
                        "0 18px 45px -20px hsl(var(--primary) / 0.45)",
                        "0 0 0 0 rgba(0,0,0,0)",
                      ],
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 2.2,
                  ease: easeOut,
                }}
              >
                <m.div
                  className="inline-flex rounded-2xl"
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          boxShadow:
                            "0 18px 40px -22px hsl(var(--primary) / 0.55)",
                        }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                >
                  <LuxuryButton asChild tone="primary">
                    <Link href="/store/products">{fa.store.finalCta}</Link>
                  </LuxuryButton>
                </m.div>
              </m.div>
            </Container>
          </m.section>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
