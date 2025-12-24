"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Truck, Shield, RotateCcw, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"

gsap.registerPlugin(ScrollTrigger)

export default function StoreLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Hero text reveal - slow and confident
      gsap.from(".hero-title", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power3.out",
      })

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out",
      })

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      })

      // Pinned storytelling section
      if (storyRef.current) {
        ScrollTrigger.create({
          trigger: storyRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        })

        gsap.to(".story-text-1", {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top top",
            end: "50%",
            scrub: 1,
          },
        })

        gsap.to(".story-text-2", {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "50%",
            end: "100%",
            scrub: 1,
          },
        })
      }

      // Section fade-ups - subtle and elegant
      sectionRefs.current.forEach((section, index) => {
        if (section) {
          gsap.from(section, {
            opacity: 0,
            y: 60,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
            duration: 1,
            delay: index * 0.1,
            ease: "power2.out",
          })
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el) sectionRefs.current.push(el)
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section - Cinematic */}
      <section
        ref={heroRef}
        className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background"
      >
        <div className="absolute inset-0 grain-texture" />
        <div className="editorial-container relative z-10 text-center px-4 py-20">
          <h1 className="hero-title text-display font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-l from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              استایلینو
            </span>
          </h1>
          <p className="hero-subtitle text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            بهترین انتخاب برای استایل روزانه شما
            <br />
            <span className="text-foreground/60">کیفیت، زیبایی، اعتماد</span>
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store/products">
              <Button size="lg" className="btn-editorial">
                مشاهده محصولات
              </Button>
            </Link>
            <Link href="/store/categories">
              <Button size="lg" variant="outline" className="btn-editorial">
                دسته‌بندی‌ها
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling Section - Pinned ScrollTrigger */}
      <section
        ref={storyRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 overflow-hidden"
      >
        <div className="editorial-container text-center px-4">
          <div className="story-text-1 max-w-3xl mx-auto">
            <h2 className="text-hero font-bold mb-6">داستان ما</h2>
            <p className="text-body text-muted-foreground leading-relaxed">
              استایلینو با هدف ارائه بهترین تجربه خرید آنلاین پوشاک زنانه در ایران تأسیس شد.
            </p>
          </div>
          <div className="story-text-2 opacity-0 max-w-3xl mx-auto">
            <h2 className="text-hero font-bold mb-6">ماموریت ما</h2>
            <p className="text-body text-muted-foreground leading-relaxed">
              ما به کیفیت، زیبایی و رضایت مشتریان خود متعهد هستیم.
              هر محصول با دقت انتخاب شده تا استایل روزانه شما را کامل کند.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Editorial */}
      <section className="section-spacing bg-background">
        <div className="editorial-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card
              ref={addToRefs}
              className="card-editorial border-0 text-center p-10"
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">محصولات باکیفیت</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                بهترین کیفیت با مناسب‌ترین قیمت
              </p>
            </Card>

            <Card
              ref={addToRefs}
              className="card-editorial border-0 text-center p-10"
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">ارسال سریع</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                ارسال در کمترین زمان ممکن به سراسر کشور
              </p>
            </Card>

            <Card
              ref={addToRefs}
              className="card-editorial border-0 text-center p-10"
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">ضمانت رضایت</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                تضمین رضایت شما از خرید
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="section-spacing bg-muted/20">
        <div className="editorial-container px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-hero font-bold mb-4">محصولات ویژه</h2>
              <p className="text-body text-muted-foreground">انتخاب‌های برتر ما برای شما</p>
            </div>
            <Link href="/store/products?featured=true" className="hidden lg:block">
              <Button variant="ghost" className="btn-editorial">
                مشاهده همه
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Placeholder product cards - will be replaced with real data */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="card-editorial aspect-[4/5] bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Elegant */}
      <section className="section-spacing bg-background">
        <div className="editorial-container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 text-center">
            <div>
              <div className="text-hero font-bold text-primary mb-3 persian-number">۱۰۰٪</div>
              <div className="text-caption text-muted-foreground">رضایت مشتری</div>
            </div>
            <div>
              <div className="text-hero font-bold text-primary mb-3 persian-number">۵۰۰۰+</div>
              <div className="text-caption text-muted-foreground">مشتری راضی</div>
            </div>
            <div>
              <div className="text-hero font-bold text-primary mb-3 persian-number">۲۴/۷</div>
              <div className="text-caption text-muted-foreground">پشتیبانی</div>
            </div>
            <div>
              <div className="text-hero font-bold text-primary mb-3 persian-number">۱۰۰+</div>
              <div className="text-caption text-muted-foreground">محصول</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Confident */}
      <section className="section-spacing bg-gradient-to-l from-primary/5 via-primary/3 to-background">
        <div className="editorial-container px-4 text-center">
          <h2 className="text-hero font-bold mb-6">آماده شروع خرید هستید؟</h2>
          <p className="text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            به جمع هزاران مشتری راضی ما بپیوندید
          </p>
          <Link href="/store/products">
            <Button size="lg" className="btn-editorial">
              شروع خرید
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
