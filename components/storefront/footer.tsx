"use client"

import Link from "next/link"
import { Instagram, Mail, Phone, MapPin } from "lucide-react"
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion"
import { Container } from "@/components/ui/container"
import { fa } from "@/lib/copy/fa"

export function Footer() {
  const prefersReducedMotion = useReducedMotion()
  const easing = [0.22, 0.61, 0.36, 1] as const
  const reveal = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.9, ease: easing },
    },
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.footer
        className="border-t border-border/30 bg-muted/20 mt-auto"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={reveal}
      >
        <Container className="pt-20 pb-28 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-l from-foreground to-primary bg-clip-text text-transparent">
                  {fa.brand.name}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {fa.brand.footerDescription}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/"
                  className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-300"
                  aria-label={fa.footer.socialInstagram}
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="mailto:info@stylino.ir"
                  className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-300"
                  aria-label={fa.footer.socialEmail}
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground">{fa.footer.quickLinks}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/store/about"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store/contact"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.contactLink}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store/faq"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.faq}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground">{fa.footer.customerService}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/store/shipping"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.shipping}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store/size-guide"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.sizeGuide}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store/care"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {fa.footer.care}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground">{fa.footer.contact}</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span dir="ltr">{fa.footer.phone}</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span dir="ltr">{fa.footer.email}</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{fa.footer.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-right">
              c <span dir="ltr">{new Date().getFullYear().toLocaleString("fa-IR")}</span>{" "}
              {fa.footer.rights}
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/store/privacy"
                className="hover:text-foreground transition-colors duration-300"
              >
                {fa.footer.privacy}
              </Link>
              <Link
                href="/store/terms"
                className="hover:text-foreground transition-colors duration-300"
              >
                {fa.footer.terms}
              </Link>
            </div>
          </div>
        </Container>
      </m.footer>
    </LazyMotion>
  )
}
