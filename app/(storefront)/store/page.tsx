"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Truck, Shield, RotateCcw, Sparkles, Star, Award, Heart } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"

gsap.registerPlugin(ScrollTrigger)

export default function StoreLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<HTMLDivElement[]>([])
  const storyImageRef = useRef<HTMLDivElement>(null)

  // Fetch featured products
  const { data: productsData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=6")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

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

      // Enhanced pinned storytelling section with image transitions
      if (storyRef.current) {
        ScrollTrigger.create({
          trigger: storyRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        })

        // Text transitions
        gsap.to(".story-text-1", {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top top",
            end: "33%",
            scrub: 1,
          },
        })

        gsap.fromTo(
          ".story-text-2",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: storyRef.current,
              start: "33%",
              end: "66%",
              scrub: 1,
            },
          }
        )

        gsap.to(".story-text-2", {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "66%",
            end: "100%",
            scrub: 1,
          },
        })

        gsap.fromTo(
          ".story-text-3",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: storyRef.current,
              start: "66%",
              end: "100%",
              scrub: 1,
            },
          }
        )

        // Background image parallax
        if (storyImageRef.current) {
          gsap.to(storyImageRef.current, {
            scale: 1.2,
            opacity: 0.3,
            scrollTrigger: {
              trigger: storyRef.current,
              start: "top top",
              end: "100%",
              scrub: 1,
            },
          })
        }
      }

      // Section fade-ups with stagger
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
            delay: index * 0.15,
            ease: "power2.out",
          })
        }
      })

      // Product cards stagger animation
      gsap.from(".product-card-animate", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        duration: 0.8,
        ease: "power2.out",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [productsData])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el)
  }

  const featuredProducts = productsData?.products?.slice(0, 6) || []
  const featuredCategories = categories?.slice(0, 3) || []

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section - Cinematic with Image */}
      <section
        ref={heroRef}
        className="relative min-h-[95vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95" />
          <div className="absolute inset-0 grain-texture" />
        </div>
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

      {/* Storytelling Section - Enhanced Pinned ScrollTrigger */}
      <section
        ref={storyRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background"
      >
        <div
          ref={storyImageRef}
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80)",
          }}
        />
        <div className="editorial-container text-center px-4 relative z-10">
          <div className="story-text-1 max-w-3xl mx-auto">
            <h2 className="text-hero font-bold mb-6">داستان ما</h2>
            <p className="text-body text-muted-foreground leading-relaxed text-lg">
              استایلینو با هدف ارائه بهترین تجربه خرید آنلاین پوشاک زنانه در ایران تأسیس شد.
              ما معتقدیم که هر زن حق دارد بهترین استایل را داشته باشد.
            </p>
          </div>
          <div className="story-text-2 opacity-0 max-w-3xl mx-auto absolute inset-0 flex items-center justify-center">
            <div>
              <h2 className="text-hero font-bold mb-6">ماموریت ما</h2>
              <p className="text-body text-muted-foreground leading-relaxed text-lg">
                ما به کیفیت، زیبایی و رضایت مشتریان خود متعهد هستیم.
                هر محصول با دقت انتخاب شده تا استایل روزانه شما را کامل کند.
              </p>
            </div>
          </div>
          <div className="story-text-3 opacity-0 max-w-3xl mx-auto absolute inset-0 flex items-center justify-center">
            <div>
              <h2 className="text-hero font-bold mb-6">چشم‌انداز ما</h2>
              <p className="text-body text-muted-foreground leading-relaxed text-lg">
                تبدیل شدن به برند پیشرو در صنعت مد و پوشاک آنلاین ایران،
                با تمرکز بر نوآوری، کیفیت و رضایت مشتری.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="section-spacing bg-background">
        <div className="editorial-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">محصولات باکیفیت</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                بهترین کیفیت با مناسب‌ترین قیمت
              </p>
            </Card>

            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">ارسال سریع</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                ارسال در کمترین زمان ممکن به سراسر کشور
              </p>
            </Card>

            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">ضمانت رضایت</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                تضمین رضایت شما از خرید
              </p>
            </Card>

            <Card ref={addToRefs} className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">بازگشت آسان</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                امکان بازگشت محصول در صورت عدم رضایت
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="section-spacing bg-muted/20" ref={addToRefs}>
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
          {featuredProducts.length > 0 ? (
            <div className="products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product: any, index: number) => (
                <div key={product.id} className="product-card-animate">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    basePrice={product.basePrice}
                    images={product.images}
                    variants={product.variants}
                    featured={product.featured}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-title font-bold mb-3">محصولی یافت نشد</h3>
              <p className="text-body text-muted-foreground mb-8">
                به زودی محصولات ویژه اضافه خواهند شد
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Category Spotlight */}
      {featuredCategories.length > 0 && (
        <section className="section-spacing bg-background" ref={addToRefs}>
          <div className="editorial-container px-4">
            <div className="mb-16 text-center">
              <h2 className="text-hero font-bold mb-4">دسته‌بندی‌های محبوب</h2>
              <p className="text-body text-muted-foreground">کاوش در مجموعه‌های ما</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {featuredCategories.map((category: any, index: number) => (
                <Link
                  key={category.id}
                  href={`/store/products?category=${category.slug}`}
                  className="group"
                >
                  <Card className="card-editorial overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-title font-bold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-body text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      {category._count?.products > 0 && (
                        <p className="text-sm text-muted-foreground mt-3 persian-number">
                          {category._count.products} محصول
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section - Enhanced */}
      <section className="section-spacing bg-muted/30" ref={addToRefs}>
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

      {/* CTA Section - Enhanced */}
      <section className="section-spacing bg-gradient-to-l from-primary/5 via-primary/3 to-background" ref={addToRefs}>
        <div className="editorial-container px-4 text-center">
          <h2 className="text-hero font-bold mb-6">آماده شروع خرید هستید؟</h2>
          <p className="text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            به جمع هزاران مشتری راضی ما بپیوندید و استایل خود را متحول کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store/products">
              <Button size="lg" className="btn-editorial">
                شروع خرید
              </Button>
            </Link>
            <Link href="/store/about">
              <Button size="lg" variant="outline" className="btn-editorial">
                درباره ما
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
