"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import type { BenchmarkData } from "@/lib/types"

interface BenchmarkDisplayProps {
  benchmark: BenchmarkData
}

export function BenchmarkDisplay({ benchmark }: BenchmarkDisplayProps) {
  const getPerformanceColor = (diff: number) => {
    if (diff > 0.5) return "text-green-600"
    if (diff < -0.5) return "text-red-600"
    return "text-muted-foreground"
  }

  const getPerformanceBadge = (diff: number) => {
    if (diff > 0.5) return <Badge className="bg-green-100 text-green-700">Above Average</Badge>
    if (diff < -0.5) return <Badge className="bg-red-100 text-red-700">Below Average</Badge>
    return <Badge variant="secondary">Average</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Performance Benchmark</CardTitle>
        </div>
        <CardDescription>How this store compares to others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Rating */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-3xl font-bold">{benchmark.storeRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Your Store Rating</div>
        </div>

        {/* Category Comparison */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">vs Category Average</span>
            <span className={`text-sm font-semibold ${getPerformanceColor(benchmark.vsCategory)}`}>
              {benchmark.vsCategory > 0 ? "+" : ""}
              {benchmark.vsCategory.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, (benchmark.storeRating / 5) * 100))}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{benchmark.categoryAverage.toFixed(1)}</span>
          </div>
          {getPerformanceBadge(benchmark.vsCategory)}
        </div>

        {/* City Comparison */}
        {benchmark.cityAverage !== null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">vs City Average</span>
              <span className={`text-sm font-semibold ${getPerformanceColor(benchmark.vsCity || 0)}`}>
                {benchmark.vsCity && benchmark.vsCity > 0 ? "+" : ""}
                {benchmark.vsCity?.toFixed(1) || "0.0"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (benchmark.storeRating / 5) * 100))}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{benchmark.cityAverage.toFixed(1)}</span>
            </div>
            {benchmark.vsCity !== null && getPerformanceBadge(benchmark.vsCity)}
          </div>
        )}

        {/* Percentile */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Percentile Rank</span>
            <span className="text-lg font-bold">{benchmark.percentile}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This store ranks in the top {100 - benchmark.percentile}% of stores in this category
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

