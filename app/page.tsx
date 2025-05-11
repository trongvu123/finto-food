import FeaturedProducts from "@/components/featured-products"
import HeroSection from "@/components/hero-section"
import IntroSection from "@/components/intro-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <HeroSection />
      <IntroSection />
      <FeaturedProducts />
    </div>
  )
}
