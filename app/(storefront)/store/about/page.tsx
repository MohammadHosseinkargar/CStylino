"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  Tag,
  HeartHandshake,
  Headphones,
  Sparkles,
} from "lucide-react"
import { fa } from "@/lib/copy/fa"

const featureIcons = [Tag, HeartHandshake, ShieldCheck, Headphones]

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-8 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
            <Sparkles className="w-3 h-3" />
            <span>{fa.about.badge}</span>
          </div>

          <SectionHeader title={fa.about.title} className="text-right" />

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>{fa.about.intro}</p>
            <p>{fa.about.introSecond}</p>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative flex items-center justify-center py-10">
          <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] animate-pulse" />

          <div className="relative w-full max-w-[350px] aspect-square flex items-center justify-center rounded-[2.5rem] border border-border/30 bg-muted/30 backdrop-blur-2xl shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

            <div className="text-center z-10 transition-transform duration-500 group-hover:scale-110">
              <span className="block text-8xl font-thin tracking-tighter text-foreground/90 leading-none">
                س
              </span>
              <div className="h-[1.5px] w-14 bg-primary mx-auto my-4" />
              <h2 className="text-2xl font-light tracking-[0.2em] text-foreground">
                {fa.brand.name}
              </h2>
              <p className="text-[10px] tracking-[0.5em] text-muted-foreground mt-3 font-medium">
                {fa.about.premiumLabel}
              </p>
            </div>

            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
          {fa.about.features.map((item, index) => {
            const Icon = featureIcons[index]
            return (
              <div
                key={item.title}
                className="relative p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 mb-5 rounded-2xl bg-background border flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-7">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-32 relative overflow-hidden rounded-[3rem] bg-foreground text-background p-12 md:p-20 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{fa.about.ctaTitle}</h2>
          <p className="text-muted-foreground mb-10 text-lg">{fa.about.ctaDescription}</p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full px-12 h-14 text-base font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/store/products">{fa.about.ctaButton}</Link>
          </Button>
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-[80px]" />
      </section>
    </PageContainer>
  )
}
