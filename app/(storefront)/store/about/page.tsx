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
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            <span>داستان برند ما</span>
          </div>
          <SectionHeader title="درباره استایلینو" className="text-right" />
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              استایلینو فراتر از یک فروشگاه پوشاک، یک مقصد برای کسانی است که به دنبال تلاقی کیفیت و مدهای روز هستند. ما با وسواس فراوان تک‌تک محصولات را انتخاب می‌کنیم.
            </p>
            <p>
              تیم ما معتقد است که هر لباسی داستانی دارد و ما اینجا هستیم تا به شما کمک کنیم زیباترین داستان خود را بپوشید.
            </p>
          </div>
        </div>

        {/* لوگوی جدید و خلاقانه (Glassmorphism Concept) */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center py-10">
          <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="text-center z-10">
              <span className="block text-7xl font-thin tracking-tighter text-foreground/80 mb-2">S</span>
              <div className="h-[1px] w-12 bg-primary mx-auto mb-4" />
              <h2 className="text-2xl font-light tracking-[0.2em] uppercase text-foreground">Stylino</h2>
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mt-2">Premium Wear</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item) => (
            <div key={item.title} className="relative p-6 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all group">
              <div className="w-10 h-10 mb-4 rounded-xl bg-background border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 relative overflow-hidden rounded-[2.5rem] bg-foreground text-background p-12 text-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-white">آماده تغییر استایل هستید؟</h2>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-12 font-bold hover:scale-105 transition-transform">
            <Link href="/store/products">شروع خرید</Link>
          </Button>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </section>
    </PageContainer>
  )
}