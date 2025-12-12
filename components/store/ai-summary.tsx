"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ReviewSummary } from "@/lib/types"

interface AISummaryProps {
  summary: ReviewSummary
}

export function AISummary({ summary }: AISummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Insights</CardTitle>
        </div>
        <CardDescription>What customers are saying about this store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Themes */}
        {summary.themes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Key Themes</h4>
            <div className="flex flex-wrap gap-2">
              {summary.themes.map((theme) => (
                <Badge key={theme} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* What Customers Like */}
        {summary.whatCustomersLike.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h4 className="text-sm font-semibold">What Customers Like</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.whatCustomersLike.map((item) => (
                <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* What Customers Dislike */}
        {summary.whatCustomersDislike.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-semibold">Areas for Improvement</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.whatCustomersDislike.map((item) => (
                <Badge key={item} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Average Dimensions */}
        {summary.averageDimensions && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Average Ratings by Aspect</h4>
            <div className="space-y-2">
              {Object.entries(summary.averageDimensions).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key}</span>
                    <span className="font-medium">{value.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

