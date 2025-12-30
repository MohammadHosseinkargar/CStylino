"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Truck, Shield } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { StorytellingSection } from "@/components/storefront/storytelling-section"
import { fa } from "@/lib/copy/fa"

gsap.registerPlugin(ScrollTrigger)

type StoreLandingPageProps = {
  heroHeadline: string
  heroSubheadline: string
}

export function StoreLandingPage({
  heroHeadline,
  heroSubheadline,
}: StoreLandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Set<HTMLDivElement>>(new Set())

  useEffect(() => {
    if (typeof window === "undefined") return
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isDesktop = window.matchMedia("(min-width: 768px)").matches

    if (prefersReducedMotion || !isDesktop) return

    const sections = sectionRefs.current
    const ctx = gsap.context(() => {
      Array.from(sections).forEach((section, index) => {
        gsap.from(section, {
          opacity: 0,
          y: 50,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          duration: 0.9,
          delay: index * 0.08,
          ease: "power2.out",
        })
      })
    }, heroRef)

    return () => {
      ctx.revert()
      sections.clear()
    }
  }, [])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.add(el)
    }
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <section
        ref={heroRef}
        className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background"
      >
        <div className="absolute inset-0 grain-texture" />
        <PageContainer className="relative z-10 text-center px-4 py-20">
          <h1 className="hero-title hero-line hero-line-delay-1 text-display font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-l from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              {fa.brand.name}
            </span>
          </h1>
          <p className="hero-subtitle text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            <span className="hero-line hero-line-delay-2 hero-accent">{heroHeadline}</span>
            <br />
            <span className="hero-line hero-line-delay-3 text-foreground/60">
              {heroSubheadline}
            </span>
          </p>
          <div className="hero-cta hero-line hero-line-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store/products">
              <Button size="lg" className="btn-editorial">
                {fa.store.heroPrimaryCta}
              </Button>
            </Link>
            <Link href="/store/categories">
              <Button size="lg" variant="outline" className="btn-editorial">
                {fa.store.heroSecondaryCta}
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      <StorytellingSection steps={fa.store.storySteps} />

      <section className="section-spacing bg-background">
        <PageContainer className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">{fa.store.featureCards[0].title}</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                {fa.store.featureCards[0].body}
              </p>
            </Card>
            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">{fa.store.featureCards[1].title}</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                {fa.store.featureCards[1].body}
              </p>
            </Card>
            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">{fa.store.featureCards[2].title}</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                {fa.store.featureCards[2].body}
              </p>
            </Card>
          </div>
        </PageContainer>
      </section>

      <section className="section-spacing bg-muted/20">
        <PageContainer className="px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-hero font-bold mb-4">{fa.store.featuredTitle}</h2>
              <p className="text-body text-muted-foreground">{fa.store.featuredSubtitle}</p>
            </div>
            <Link href="/store/products?featured=true" className="hidden lg:block">
              <Button variant="ghost" className="btn-editorial">
                {fa.store.featuredCta}
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-editorial aspect-[4/5] bg-muted/30 animate-pulse" />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section-spacing bg-background">
        <PageContainer className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 text-center">
            {fa.store.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-hero font-bold text-primary mb-3 persian-number">{stat.value}</div>
                <div className="text-caption text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section-spacing bg-gradient-to-l from-primary/5 via-primary/3 to-background">
        <PageContainer className="px-4 text-center">
          <h2 className="text-hero font-bold mb-6">{fa.store.finalTitle}</h2>
          <p className="text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {fa.store.finalSubtitle}
          </p>
          <Link href="/store/products">
            <Button size="lg" className="btn-editorial">
              {fa.store.finalCta}
            </Button>
          </Link>
        </PageContainer>
      </section>
    </div>
  )
}
