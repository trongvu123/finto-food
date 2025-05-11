"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoadingPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Loading</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Please wait while we load the page...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 