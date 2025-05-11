import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-lg bg-gray-100 py-12 md:py-16 my-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Thức ăn chất lượng cao cho thú cưng của bạn
            </h1>
            <p className="mt-4 text-lg text-gray-600 md:text-xl">
              Finto cung cấp các sản phẩm dinh dưỡng tốt nhất cho những người bạn bốn chân của bạn.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg">
                <Link href="/san-pham/cho">Sản phẩm cho chó</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/san-pham/meo">Sản phẩm cho mèo</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Thú cưng hạnh phúc"
              className="rounded-lg object-cover"
              fill
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
