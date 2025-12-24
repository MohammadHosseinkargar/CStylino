import Link from "next/link"
import { Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-muted/20 mt-auto">
      <div className="editorial-container pt-20 pb-28 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-l from-foreground to-primary bg-clip-text text-transparent">
                استایلینو
              </span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              بهترین فروشگاه آنلاین پوشاک زنانه در ایران. ما به شما کمک می‌کنیم تا استایل روزانه خود را بهبود بخشید.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-300"
                aria-label="اینستاگرام"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-300"
                aria-label="ایمیل"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">لینک‌های سریع</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/store/about" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/store/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/store/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link href="/store/faq" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">خدمات مشتریان</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/store/shipping" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  ارسال و بازگشت
                </Link>
              </li>
              <li>
                <Link href="/store/size-guide" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  راهنمای سایز
                </Link>
              </li>
              <li>
                <Link href="/store/care" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  نگهداری محصولات
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">تماس با ما</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>021-12345678</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>info@stylino.ir</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>تهران، خیابان نمونه</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} استایلینو. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/store/privacy" className="hover:text-foreground transition-colors duration-300">
              حریم خصوصی
            </Link>
            <Link href="/store/terms" className="hover:text-foreground transition-colors duration-300">
              شرایط استفاده
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
