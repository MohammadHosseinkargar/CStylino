"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Preloader } from "@/components/storefront/preloader"
import { SplitText } from "@/components/storefront/split-text"
import { StorytellingSection } from "@/components/storefront/storytelling-section"
import { ArrowLeft, ShieldCheck, Star, Truck } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const categories = [
  { name: "مانتو و پالتو", image: "/placeholders/category-tailoring.svg", slug: "manto" },
  { name: "شومیز و بلوز", image: "/placeholders/category-essentials.svg", slug: "shomiz" },
  { name: "اکسسوری", image: "/placeholders/category-accessories.svg", slug: "accessories" },
]

const features = [
  { icon: Truck, title: "ارسال رایگان", desc: "برای سفارش‌های بالای ۲ میلیون تومان" },
  { icon: ShieldCheck, title: "ضمانت اصالت", desc: "تضمین کیفیت و اصالت تمام کالاها" },
  { icon: Star, title: "پشتیبانی اختصاصی", desc: "مشاوره رایگان استایل با متخصصین" },
]

export default function StoreLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Preloader />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="z-10 max-w-4xl space-y-8">
          <div className="space-y-2">
            <span className="inline-block text-accent uppercase tracking-[0.2em] text-sm md:text-base animate-fade-in">
              کالکشن جدید ۱۴۰۳
            </span>
            <div className="text-5xl md:text-7xl lg:text-8xl font-display font-light leading-[1.1] text-balance">
              <SplitText delay={0.5}>
                زیبایی در سادگی و اصالت است
              </SplitText>
            </div>
          </div>
          
          <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-up opacity-0" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            استایلینو، روایتی نو از پوشاک بانوان با تکیه بر ظرافت دوخت و کیفیت پارچه.
            تجربه‌ای متفاوت از خرید آنلاین.
          </p>
          
          <div className="pt-8 animate-fade-up opacity-0" style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}>
            <Link href="/store/products">
              <Button size="lg" className="text-lg px-12 rounded-full">
                مشاهده محصولات
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <StorytellingSection />

      {/* Featured Categories */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-display mb-4">دسته‌بندی‌های منتخب</h2>
            <p className="text-muted-foreground text-lg">قطعاتی که کمد لباس شما را کامل می‌کنند</p>
          </div>
          <Link href="/store/categories">
            <Button variant="outline" className="rounded-full">همه دسته‌بندی‌ها</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <Link key={i} href={`/store/products?category=${cat.slug}`} className="group block relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
              {/* Placeholder Image */}
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  <span className="opacity-20">{cat.name}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-medium text-white mb-2">{cat.name}</h3>
                <span className="inline-flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                  مشاهده <ArrowLeft className="mr-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-20 bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center text-accent shadow-sm">
                <feat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium">{feat.title}</h3>
              <p className="text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Note: Best Sellers section would typically fetch data. 
          For this redesign, we'll leave a placeholder or link to products page if no data fetching logic is provided here. 
          Assuming the original page didn't fetch products directly in the client component without props.
      */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-display mb-8">جدیدترین‌های فصل</h2>
        <Link href="/store/products">
          <Button size="lg" variant="outline" className="rounded-full">
            مشاهده همه محصولات
          </Button>
        </Link>
      </section>
    </main>
  )
}
