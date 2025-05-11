"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The page you are looking for does not exist.</p>
            <Button onClick={() => router.push("/admin")}>Go back</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 