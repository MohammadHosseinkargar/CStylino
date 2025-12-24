"use client"

import { useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Sparkles, Heart } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"

const StorytellingSection = dynamic(
  () => import("@/components/storefront/storytelling-section").then((mod) => mod.StorytellingSection),
  { ssr: false }
)

gsap.registerPlugin(ScrollTrigger)

type PlaceholderProduct = {
  id: string
  name: string
  subtitle: string
  price: string
  image: string
}

export default function StoreLandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  const { data: productsData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=6")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

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
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        opacity: 0,
        y: 36,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      })

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 24,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      })

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 18,
        duration: 0.9,
        delay: 0.35,
        ease: "power3.out",
      })

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element, index) => {
        gsap.from(element, {
          opacity: 0,
          y: 28,
          duration: 0.8,
          ease: "power2.out",
          delay: Math.min(index * 0.05, 0.3),
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })

      gsap.from(".product-card-animate", {
        opacity: 0,
        y: 26,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".best-sellers-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    }, pageRef)

    return () => ctx.revert()
  }, [productsData, categories])

  const placeholderCategories = [
    {
      id: "tailoring",
      slug: "tailoring",
      name: "????? ?????",
      description: "????????? ??????? ?? ???? ???? ? ????? ??? ????.",
      image: "/placeholders/category-tailoring.svg",
    },
    {
      id: "essentials",
      slug: "essentials",
      name: "??????? ??????",
      description: "?????? ???? ???? ????? ???? ? ????? ???? ?? ???.",
      image: "/placeholders/category-essentials.svg",
    },
    {
      id: "accessories",
      slug: "accessories",
      name: "??????? ??? ?????",
      description: "??????? ?? ?????? ?? ???? ? ???? ?? ???.",
      image: "/placeholders/category-accessories.svg",
    },
  ]

  const placeholderProducts: PlaceholderProduct[] = [
    {
      id: "p1",
      name: "?? ???? ??????",
      subtitle: "??? ??? ?? ???? ???????",
      price: "????????? ?????",
      image: "/placeholders/product-1.svg",
    },
    {
      id: "p2",
      name: "?????? ???? ????",
      subtitle: "???? ???? ? ????? ??? ??? ???",
      price: "????????? ?????",
      image: "/placeholders/product-2.svg",
    },
    {
      id: "p3",
      name: "????? ????? ???????",
      subtitle: "????? ??? ?? ??? ???? ?????",
      price: "????????? ?????",
      image: "/placeholders/product-3.svg",
    },
    {
      id: "p4",
      name: "????? ???????",
      subtitle: "????? ?????? ?? ??? ????",
      price: "????????? ?????",
      image: "/placeholders/product-1.svg",
    },
    {
      id: "p5",
      name: "??? ???? ???????",
      subtitle: "????? ????? ??? ???? ?????",
      price: "????????? ?????",
      image: "/placeholders/product-2.svg",
    },
    {
      id: "p6",
      name: "???? ????? ???",
      subtitle: "???? ???? ?? ???? ???",
      price: "????????? ?????",
      image: "/placeholders/product-3.svg",
    },
  ]

  const storySteps = [
    {
      title: "???? ?? ???? ??? ?? ????",
      body: "?? ?????? ?? ????? ????? ? ???? ???? ?? ???. ???? ?????? ????? ? ??? ?????? ????? ???? ?? ???? ??? ???.",
      image: "/placeholders/story-atelier-1.svg",
      kicker: "??? ???",
    },
    {
      title: "????? ??? ?????? ??? ?????",
      body: "????? ????? ?? ???? ??? ???? ?????? ?? ???? ?? ?? ???? ?? ???? ?? ? ??? ????? ????.",
      image: "/placeholders/story-atelier-2.svg",
      kicker: "??? ???",
    },
    {
      title: "???? ????? ?????? ???????",
      body: "??? ?? ?? ??? ????? ?? ???? ?? ????? ??? ? ????? ??? ???? ???? ?????? ???? ?????.",
      image: "/placeholders/story-atelier-3.svg",
      kicker: "??? ???",
    },
    {
      title: "???? ?????? ????? ????",
      body: "?? ???? ?? ?? ????? ??? ? ???? ???? ??????? ????? ?? ??? ?? ????? ??? ?? ???? ???.",
      image: "/placeholders/story-atelier-4.svg",
      kicker: "??? ?????",
    },
  ]

  const featuredCategories = categories?.slice(0, 3) || []
  const resolvedCategories = featuredCategories.length > 0 ? featuredCategories : placeholderCategories

  const bestSellerItems = useMemo(() => {
    const realProducts = productsData?.products || []
    const resolved = [...realProducts]

    if (resolved.length < 6) {
      const needed = 6 - resolved.length
      resolved.push(...placeholderProducts.slice(0, needed))
    }

    return resolved.slice(0, 6)
  }, [productsData])

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-background via-secondary/40 to-background" dir="rtl">
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/placeholders/hero-fashion.svg"
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/75 to-background/95" />
          <div className="absolute inset-0 grain-texture" />
        </div>
        <div className="page-container relative z-10 text-center px-4 py-24">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground mb-6">?????? ????? ?????</p>
          <h1 className="text-display font-bold mb-8 leading-tight">
            <span className="hero-line block bg-gradient-to-l from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              ???? ???? ???? ????? ???????
            </span>
            <span className="hero-line block">?? ??? ???</span>
          </h1>
          <p className="hero-subtitle text-subtitle text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            ?????? ??? ????? ?? ???? ????? ????? ??? ????? ? ??? ???? ?? ???? ??? ???????????. ?????? ?? ?? ????? ?? ?????.
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store/products">
              <Button size="lg" className="btn-editorial">
                ?????? ???????
              </Button>
            </Link>
            <Link href="/store/categories">
              <Button size="lg" variant="outline" className="btn-editorial">
                ???? ???? ???? ??
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-background" data-reveal>
        <div className="page-container px-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground mb-4">???? ???? ?????</p>
              <h2 className="text-hero font-bold mb-4">??? ???? ???? ?? ???? ????</h2>
              <p className="text-body text-muted-foreground max-w-2xl">
                ?? ????? ?????? ?? ??????? ??????? ?? ???? ???? ???? ??? ?? ??? ???? ?? ??? ??? ????? ??? ???.
              </p>
            </div>
            <Link href="/store/categories" className="self-start lg:self-auto">
              <Button variant="ghost" className="btn-editorial">
                ?????? ??? ???? ???? ??
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {resolvedCategories.slice(0, 3).map((category: any, index: number) => (
              <Link
                key={category.id ?? category.slug ?? index}
                href={`/store/products?category=${category.slug ?? ""}`}
                className="group"
              >
                <Card className="card-editorial overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                    <Image
                      src={
                        category.image ||
                        placeholderCategories[index % placeholderCategories.length].image
                      }
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-title font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-body text-muted-foreground line-clamp-2">
                      {category.description || placeholderCategories[index % placeholderCategories.length].description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StorytellingSection steps={storySteps} />

      <section className="section-spacing bg-muted/15" data-reveal>
        <div className="page-container px-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground mb-4">?????? ??? ?????</p>
              <h2 className="text-hero font-bold mb-4">?????? ??? ????? ???</h2>
              <p className="text-body text-muted-foreground max-w-2xl">
                ?????? ?? ??????? ?????? ?? ????? ???? ?? ?????? ???? ?? ??????? ???.
              </p>
            </div>
            <Link href="/store/products?featured=true" className="self-start lg:self-auto">
              <Button variant="ghost" className="btn-editorial">
                ?????? ??? ?????? ??
              </Button>
            </Link>
          </div>
          <div className="best-sellers-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {bestSellerItems.map((product: any) => {
              const isPlaceholder = "subtitle" in product
              if (!isPlaceholder) {
                return (
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
                )
              }

              const placeholder = product as PlaceholderProduct

              return (
                <Card key={placeholder.id} className="card-editorial overflow-hidden product-card-animate">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
                    <Image src={placeholder.image} alt={placeholder.name} fill className="object-cover" />
                    <div className="absolute top-4 right-4 bg-background/80 text-xs px-3 py-1 rounded-full">
                      ??????
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-base mb-1">{placeholder.name}</h3>
                    <p className="text-sm text-muted-foreground">{placeholder.subtitle}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold persian-number">{placeholder.price}</span>
                      <Button size="sm" variant="ghost" className="btn-editorial">
                        ??????
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-background" data-reveal>
        <div className="page-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">????? ???? ?????</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                ?? ???? ?? ????? ????? ??? ????? ?? ????? ?? ??? ?? ?????? ???? ? ???? ???? ?????.
              </p>
            </Card>

            <Card className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">??????? ???? ? ?????</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                ????? ??? ????? ?? ???? ??? ? ??? ??? ???? ?????? ?? ???? ?? ????? ???? ??????? ????.
              </p>
            </Card>

            <Card className="card-editorial border-0 text-center p-10">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-title font-bold mb-3">????? ? ????? ????</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                ?????? ???? ????? ?? ???? ?? ?? ????? ?? ??? ??? ? ?????? ???? ??? ?????? ????.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-muted/30" data-reveal>
        <div className="page-container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Truck className="h-8 w-8 text-primary" />
              <p className="text-body font-semibold">????? ????</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <p className="text-body font-semibold">?????? ???</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <p className="text-body font-semibold">????? ?????</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <RotateCcw className="h-8 w-8 text-primary" />
              <p className="text-body font-semibold">????????</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-gradient-to-l from-primary/10 via-background to-secondary/40" data-reveal>
        <div className="page-container px-4">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground mb-4">?????? ????</p>
              <h2 className="text-hero font-bold mb-6">????? ?? ???? ????? ??? ????</h2>
              <p className="text-body text-muted-foreground leading-relaxed">
                ????? ???? ????? ????? ??? ?? ?????? ?? ?? ????? ? ???? ?? ???? ?????. ?? ?????? ????? ??? ? ?? ???? ??????? ??? ????
                ?? ??? ??????? ?? ????? ?????? ????.
              </p>
            </div>
            <div className="card-editorial p-8 bg-background/70 backdrop-blur" aria-label="newsletter">
              <h3 className="text-title font-bold mb-4">??????? ???????</h3>
              <p className="text-body text-muted-foreground mb-6">
                ??? ?? ????? ??? ?? ? ??? ??? ???? ?? ?????? ? ???????? ??? ????? ?????? ????.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input type="email" placeholder="????? ???" />
                <Button className="btn-editorial" type="button">
                  ?????
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

