"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const chapters = [
  {
    title: "فصل اول: اصالت",
    text: "طراحی‌های ما ریشه در فرهنگ غنی ایرانی دارند، اما با نگاهی مدرن و جهانی.",
    image: "/placeholders/story-atelier-1.svg", // Need to ensure these exist or use placeholders
    color: "bg-[#FDFCF8]"
  },
  {
    title: "فصل دوم: ظرافت",
    text: "جزئیات، همه چیز است. دوخت‌های دقیق و پارچه‌های اعلا، امضای ماست.",
    image: "/placeholders/story-atelier-2.svg",
    color: "bg-[#F9F8F4]"
  },
  {
    title: "فصل سوم: راحتی",
    text: "زیبایی نباید به قیمت راحتی باشد. استایل شما باید بازتابی از آرامش درونتان باشد.",
    image: "/placeholders/story-atelier-3.svg",
    color: "bg-[#F5F4F0]"
  },
  {
    title: "فصل چهارم: شما",
    text: "ما فقط لباس نمی‌دوزیم، ما همراه لحظات خاص زندگی شما هستیم.",
    image: "/placeholders/story-atelier-4.svg",
    color: "bg-[#F0EFE9]"
  }
]

export function StorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=300%", // 4 sections -> 300% scroll distance
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      })

      chapters.forEach((_, i) => {
        if (i === 0) return
        tl.fromTo(`.chapter-${i}`, 
          { opacity: 0, scale: 0.95 }, 
          { opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" }
        )
        // Hide previous
        .to(`.chapter-${i-1}`, 
          { opacity: 0, scale: 1.05, duration: 1, ease: "power2.inOut" }, 
          "<"
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div ref={triggerRef} className="h-screen w-full overflow-hidden relative">
        {chapters.map((chapter, i) => (
          <div
            key={i}
            className={cn(
              `chapter-${i} absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-20 transition-colors duration-700`,
              chapter.color,
              i === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{ zIndex: i + 10 }}
          >
            <div className="flex-1 space-y-8 max-w-xl z-10">
              <span className="text-accent text-sm tracking-widest uppercase font-medium">
                {`0${i + 1} / 04`}
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-light text-foreground">
                {chapter.title}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {chapter.text}
              </p>
            </div>
            
            <div className="flex-1 mt-10 md:mt-0 relative w-full h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-accent/5 mix-blend-multiply pointer-events-none z-10" />
               {/* Placeholder for now - can use a solid color div if image fails */}
               <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  <span className="text-4xl opacity-20 font-display">{chapter.title}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
