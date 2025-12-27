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
  Sparkles
} from "lucide-react"

const features = [
  {
    title: "انتخاب دقیق محصولات",
    desc: "هر محصول با دقت از میان بهترین‌ها انتخاب می‌شود.",
    icon: <Tag className="w-5 h-5" />,
  },
  {
    title: "قیمت‌گذاری منصفانه",
    desc: "تعادل بین کیفیت و قیمت برای خرید مطمئن.",
    icon: <HeartHandshake className="w-5 h-5" />,
  },
  {
    title: "پرداخت امن",
    desc: "پرداخت آنلاین از طریق درگاه‌های معتبر.",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    title: "پشتیبانی واقعی",
    desc: "همراهی تیم پشتیبانی در تمام مراحل خرید.",
    icon: <Headphones className="w-5 h-5" />,
  },
]

export default function AboutPage() {
  // برای رفع خطای Hydration
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // یا یک اسکلتون ساده
  }

  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-8 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
            <Sparkles className="w-3 h-3" />
            <span>داستان برند ما</span>
          </div>
          
          <SectionHeader title="درباره استایلینو" className="text-right" />
          
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              استایلینو فراتر از یک فروشگاه پوشاک، یک مقصد برای کسانی است که به دنبال تلاقی کیفیت و مدهای روز هستند. ما با وسواس فراوان تک‌تک محصولات را انتخاب می‌کنیم تا شما بهترین تجربه را داشته باشید.
            </p>
            <p>
              تیم ما معتقد است که هر لباسی داستانی دارد و ما اینجا هستیم تا به شما کمک کنیم زیباترین داستان خود را بپوشید و در هر قدم بدرخشید.
            </p>
          </div>
        </div>

        {/* لوگوی جدید و خلاقانه (Glassmorphism Concept) */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center py-10">
          <div className="absolute w-72 h-72 bg-primary/15 rounded-full blur-[80px] animate-pulse" />
          
          <div className="relative w-full max-w-[350px] aspect-square flex items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            
            <div className="text-center z-10 transition-transform duration-500 group-hover:scale-110">
              <span className="block text-8xl font-thin tracking-tighter text-foreground/90 leading-none">S</span>
              <div className="h-[1.5px] w-14 bg-primary mx-auto my-4 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              <h2 className="text-3xl font-extralight tracking-[0.25em] uppercase text-foreground">Stylino</h2>
              <p className="text-[9px] uppercase tracking-[0.6em] text-muted-foreground mt-3 font-medium">Premium Selection</p>
            </div>

            {/* خطوط تزئینی شیشه‌ای */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
          {features.map((item) => (
            <div key={item.title} className="relative p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-muted/30 transition-all duration-300 group">
              <div className="w-12 h-12 mb-5 rounded-2xl bg-background border flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 relative overflow-hidden rounded-[3rem] bg-[#0f0f0f] text-white p-12 md:p-20 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">آماده تغییر استایل هستید؟</h2>
          <p className="text-gray-400 mb-10 text-lg">همین حالا از جدیدترین کالکشن‌های ما دیدن کنید و استایل منحصر به فرد خود را بسازید.</p>
          
          <Button asChild size="lg" variant="secondary" className="rounded-full px-12 h-14 text-base font-bold transition-all hover:bg-white hover:scale-105 active:scale-95">
            <Link href="/store/products">مشاهده همه محصولات</Link>
          </Button>
        </div>

        {/* دایره‌های تزئینی پس‌زمینه CTA */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-[80px]" />
      </section>
    </PageContainer>
  )
}