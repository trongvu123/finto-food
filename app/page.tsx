"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useInView, AnimatePresence } from "framer-motion"
import FeaturedProducts from "@/components/featured-products"
import HeroSection from "@/components/hero-section"
import IntroSection from "@/components/intro-section"
import PromotionBanner from "@/components/promotion-banner"
import TestimonialSection from "@/components/testimonial-section"
import BrandSlider from "@/components/brand-slider"
import NewsletterSection from "@/components/newsletter-section"
import BlogSection from "@/components/blog-section"
import CategorySection from "@/components/category-section"


export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollY } = useScroll()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <HeroSection />

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 } }
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <IntroSection />
          </motion.div>

          <CategorySection />

          <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <FeaturedProducts />
            </div>
          </div>

          <PromotionBanner />

          <div className="py-16">
            <div className="container mx-auto px-4">
              <TestimonialSection />
            </div>
          </div>

          <BrandSlider />

          <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <BlogSection />
            </div>
          </div>

          <NewsletterSection />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
