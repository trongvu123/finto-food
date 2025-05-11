"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductFiltersProps {
  category: string
}

export default function ProductFilters({ category }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([100000, 1000000])

  // Danh sách các thương hiệu mẫu
  const brands = [
    { id: "royal-canin", name: "Royal Canin" },
    { id: "pedigree", name: "Pedigree" },
    { id: "whiskas", name: "Whiskas" },
    { id: "purina", name: "Purina" },
    { id: "hills", name: "Hill's" },
  ]

  // Danh sách các danh mục con dựa trên danh mục chính
  const subcategories =
    category === "cho"
      ? [
          { id: "thuc-an-hat", name: "Thức ăn hạt" },
          { id: "pate", name: "Pate" },
          { id: "banh-thuong", name: "Bánh thưởng" },
          { id: "do-nhai", name: "Đồ nhai" },
        ]
      : [
          { id: "thuc-an-hat", name: "Thức ăn hạt" },
          { id: "pate", name: "Pate" },
          { id: "cat-ve-sinh", name: "Cát vệ sinh" },
          { id: "do-choi", name: "Đồ chơi" },
        ]

  // Format giá tiền sang VND
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div className="space-y-6 rounded-lg border bg-white p-4 sticky top-20">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Loại thú cưng</h3>
        <RadioGroup defaultValue={category}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cho" id="cho" />
            <Label htmlFor="cho">Chó</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="meo" id="meo" />
            <Label htmlFor="meo">Mèo</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-4 text-lg font-semibold">Danh mục</h3>
        <div className="space-y-2">
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex items-center space-x-2">
              <Checkbox id={subcategory.id} />
              <Label htmlFor={subcategory.id}>{subcategory.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-4 text-lg font-semibold">Khoảng giá</h3>
        <Slider
          defaultValue={[100000, 1000000]}
          min={0}
          max={2000000}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-6"
        />
        <div className="flex items-center justify-between text-sm">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-4 text-lg font-semibold">Thương hiệu</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox id={brand.id} />
              <Label htmlFor={brand.id}>{brand.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full">Áp dụng bộ lọc</Button>
    </div>
  )
}
