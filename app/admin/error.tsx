"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorPage({
    error,
    reset
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Something went wrong!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>An error occurred while processing your request.</p>
                        <div className="flex gap-4">
                            <Button onClick={() => reset()}>Try again</Button>
                            <Button variant="outline" onClick={() => router.push("/admin")}>
                                Go back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 