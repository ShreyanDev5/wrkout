"use client"

import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor } from "@/lib/utils"
import type { WorkoutSession } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { useMemo, useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { ChevronUp } from "lucide-react"

interface EnhancedProgressChartProps {
  sessions: WorkoutSession[]
  mainFilter: string | null
  exerciseFilter: string | null
}

type TimeframeType = "week" | "month" | "all"

export function EnhancedProgressChart({ sessions, mainFilter, exerciseFilter }: EnhancedProgressChartProps) {
  const { colorMode } = useTheme()
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")
  const [isAnimating, setIsAnimating] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Reset animation state when filters change
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [mainFilter, exerciseFilter, timeframe])

  // Filter sessions by exercise and day
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Apply main filter (day type)
      if (mainFilter && session.dayId !== mainFilter) return false

      // Apply exercise filter
      if (exerciseFilter && session.exerciseId !== exerciseFilter) return false

      // Only include sessions with both weight and reps data
      if (session.weight <= 0 || session.reps <= 0) return false

      return true
    })
  }, [sessions, mainFilter, exerciseFilter])

  // Apply timeframe filter
  const timeframeFilteredSessions = useMemo(() => {
    if (timeframe === "all") return filteredSessions

    const now = new Date()
    const cutoffDate = new Date()

    if (timeframe === "week") {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (timeframe === "month") {
      cutoffDate.setMonth(now.getMonth() - 1)
    }

    return filteredSessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= cutoffDate
    })
  }, [filteredSessions, timeframe])

  // Group sessions by date and find max weight for each date
  const chartData = useMemo(() => {
    const groupedData: Record<
      string,
      {
        date: string
        weight: number
        exerciseName: string
        dayId: string
        reps: number
        isLatest: boolean
        isPR: boolean
        index: number
      }
    > = {}

    timeframeFilteredSessions.forEach((session) => {
      const dateKey = session.date.split("T")[0]
      if (!groupedData[dateKey] || session.weight > groupedData[dateKey].weight) {
        groupedData[dateKey] = {
          date: dateKey,
          weight: session.weight,
          exerciseName: session.exerciseName,
          dayId: session.dayId,
          reps: session.reps,
          isLatest: false,
          isPR: false,
          index: 0, // Will be set correctly later
        }
      }
    })

    // Convert to array and sort by date
    const sortedData = Object.values(groupedData).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateA - dateB
    })

    // Add index to each data point
    sortedData.forEach((item, index) => {
      item.index = index
    })

    // Find the max weight (PR)
    const maxWeight = sortedData.length > 0 ? Math.max(...sortedData.map((item) => item.weight)) : 0

    // Mark the latest entry and PR
    if (sortedData.length > 0) {
      // Mark the latest entry
      sortedData[sortedData.length - 1].isLatest = true

      // Mark all PR entries
      sortedData.forEach((item) => {
        if (item.weight === maxWeight) {
          item.isPR = true
        }
      })
    }

    return sortedData
  }, [timeframeFilteredSessions])

  // Find personal record (max weight)
  const personalRecord = chartData.length ? Math.max(...chartData.map((item) => item.weight)) : 0

  // Find min weight for y-axis scaling
  const minWeight = chartData.length ? Math.max(0, Math.min(...chartData.map((item) => item.weight)) - 5) : 0

  // Format date for display - day/month format
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Format full date for tooltip
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get color based on day type or use a default if multiple days
  const getChartColor = () => {
    if (mainFilter) {
      return getWorkoutDayColor(mainFilter, colorMode)
    } else if (exerciseFilter) {
      // Find the day type for this specific exercise
      const exercise = filteredSessions.find((s) => s.exerciseId === exerciseFilter)
      if (exercise) {
        return getWorkoutDayColor(exercise.dayId, colorMode)
      }
    }
    return "#FF5733" // Default to an orange-red color
  }

  const chartColor = getChartColor()

  // Get exercise name for display
  const getExerciseName = () => {
    if (exerciseFilter) {
      const exercise = filteredSessions.find((s) => s.exerciseId === exerciseFilter)
      return exercise?.exerciseName || ""
    }
    return mainFilter ? `${mainFilter.charAt(0).toUpperCase() + mainFilter.slice(1)}` : ""
  }

  // Get current weight
  const getCurrentWeight = () => {
    if (chartData.length === 0) return 0
    return chartData[chartData.length - 1].weight
  }

  // Get weight change percentage
  const getWeightChangePercentage = () => {
    if (chartData.length < 2) return null

    const firstWeight = chartData[0].weight
    const lastWeight = chartData[chartData.length - 1].weight

    if (firstWeight === 0) return null

    const percentChange = ((lastWeight - firstWeight) / firstWeight) * 100
    return percentChange.toFixed(1)
  }

  // Custom tooltip component - always visible for selected points
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (payload && payload.length) {
      return (
        <div className="premium-tooltip">
          <div className="font-medium text-sm mb-1">{formatFullDate(label)}</div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColor }}></div>
            <div className="text-sm">
              <span className="font-semibold" style={{ color: chartColor }}>
                {payload[0].value}
              </span>
              <span className="text-zinc-400"> kg</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom dot component - always visible with section-specific colors
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props

    // Add null checks to prevent errors
    if (!cx || !cy || !payload) {
      return null
    }

    const isLatest = payload?.isLatest || false
    const isPR = payload?.isPR || false
    const isHovered = hoveredPoint === index

    // Determine if this dot should be highlighted (PR, latest, or hovered)
    const shouldHighlight = isPR || isLatest || isHovered
    const dotSize = shouldHighlight ? 6 : 4

    // Create a unique gradient ID for each dot
    const gradientId = `dotGradient-${index}`

    return (
      <g
        onMouseEnter={() => setHoveredPoint(index)}
        onMouseLeave={() => setHoveredPoint(null)}
        style={{ cursor: "pointer" }}
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={chartColor} stopOpacity="1" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Glow effect */}
        {shouldHighlight && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize + 4}
            fill="none"
            opacity={0.4}
            style={{
              filter: `drop-shadow(0 0 4px ${chartColor})`,
            }}
          />
        )}

        {/* Main dot with gradient fill */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={`url(#${gradientId})`}
          style={{
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: shouldHighlight ? `drop-shadow(0 0 3px ${chartColor})` : "none",
          }}
        />

        {/* Weight label above dot */}
        {shouldHighlight && (
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill={chartColor}
            fontSize="11"
            fontWeight="600"
            style={{
              filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))`,
            }}
          >
            {payload.weight}kg
          </text>
        )}

        {/* PR indicator */}
        {isPR && (
          <text
            x={cx}
            y={cy - 24}
            textAnchor="middle"
            fill="#FFD700"
            fontSize="10"
            fontWeight="bold"
            style={{
              filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.7))`,
            }}
          >
            PR
          </text>
        )}
      </g>
    )
  }

  // Animation variants for the chart container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Percentage change indicator
  const percentChange = getWeightChangePercentage()
  const hasImproved = percentChange && Number.parseFloat(percentChange) > 0

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="premium-chart-container">
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-xl overflow-hidden border border-zinc-700/30 shadow-xl">
        {/* Chart Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/50 to-transparent border-b border-zinc-700/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">{getExerciseName()}</h3>

              {/* Weight change indicator */}
              {percentChange && (
                <div className="flex items-center gap-1 text-xs">
                  <div
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      hasImproved ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    <ChevronUp className={`h-3 w-3 ${!hasImproved && "rotate-180"}`} />
                    <span>{Math.abs(Number.parseFloat(percentChange))}%</span>
                  </div>
                  <span className="text-zinc-500">since first record</span>
                </div>
              )}
            </div>

            <div className="text-2xl font-bold" style={{ color: chartColor }}>
              {getCurrentWeight()} <span className="text-sm font-normal text-zinc-400">kg</span>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="mt-5">
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeType)} className="w-full">
              <TabsList className="h-9 p-1 bg-zinc-800/70 rounded-full border border-zinc-700/30">
                <TabsTrigger
                  value="week"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-0 pt-6">
          <div className="h-[240px] w-full px-4 pb-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <defs>
                    {/* Gradient for area under the line */}
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>

                    {/* Filter for anti-aliasing */}
                    <filter id="anti-aliasing" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                    </filter>

                    {/* Drop shadow for the line */}
                    <filter id="lineShadow" height="200%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={chartColor} floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                    strokeOpacity={0.3}
                  />

                  {/* X-Axis (dates) */}
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    dy={10}
                  />

                  {/* Y-Axis (weights) */}
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[minWeight, Math.ceil(personalRecord * 1.1)]}
                    dx={-10}
                  />

                  {/* Tooltip */}
                  <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={false}
                    position={{ x: 0, y: 0 }}
                    cursor={false}
                  />

                  {/* Reference line for PR */}
                  {personalRecord > 0 && (
                    <ReferenceLine y={personalRecord} stroke={chartColor} strokeDasharray="3 3" strokeOpacity={0.6}>
                      <Label value={`PR: ${personalRecord}kg`} position="right" fill={chartColor} fontSize={10} />
                    </ReferenceLine>
                  )}

                  {/* Area under the line */}
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="none"
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                    isAnimationActive={isAnimating}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />

                  {/* Main trend line */}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={chartColor}
                    strokeWidth={2.5}
                    dot={<CustomDot />}
                    isAnimationActive={isAnimating}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    connectNulls={true}
                    style={{
                      filter: "url(#anti-aliasing) url(#lineShadow)",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                <div className="bg-zinc-800/50 px-4 py-3 rounded-lg border border-zinc-700/30">No data available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Label component for reference line
const Label = ({ value, position, fill, fontSize }: any) => {
  return (
    <g>
      <text
        x={position === "left" ? -40 : 10}
        y={-10}
        fill={fill}
        fontSize={fontSize}
        textAnchor={position === "left" ? "start" : "start"}
        style={{
          filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))`,
        }}
      >
        {value}
      </text>
    </g>
  )
}
