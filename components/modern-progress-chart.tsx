"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp } from "lucide-react"
import { getWorkoutDayColor } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import type { WorkoutSession } from "@/lib/types"

type TimeframeType = "week" | "month" | "all"

interface ModernProgressChartProps {
  sessions: WorkoutSession[]
  mainFilter: string | null
  exerciseFilter: string | null
}

export function ModernProgressChart({ sessions, mainFilter, exerciseFilter }: ModernProgressChartProps) {
  const { colorMode } = useTheme()
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

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

  // Process data for the chart
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
          index: 0,
        }
      }
    })

    // Convert to array and sort by date
    const sortedData = Object.values(groupedData).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
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

  // Calculate stats
  const personalRecord = chartData.length ? Math.max(...chartData.map((item) => item.weight)) : 0
  const minWeight = chartData.length ? Math.max(0, Math.min(...chartData.map((item) => item.weight)) - 5) : 0
  const currentWeight = chartData.length ? chartData[chartData.length - 1].weight : 0

  // Calculate percentage change
  const percentChange = useMemo(() => {
    if (chartData.length < 2) return null

    const firstWeight = chartData[0].weight
    const lastWeight = chartData[chartData.length - 1].weight

    if (firstWeight === 0) return null

    const change = ((lastWeight - firstWeight) / firstWeight) * 100
    return change.toFixed(1)
  }, [chartData])

  // Get color based on day type
  const chartColor = useMemo(() => {
    if (mainFilter) {
      return getWorkoutDayColor(mainFilter, colorMode)
    } else if (exerciseFilter) {
      const exercise = filteredSessions.find((s) => s.exerciseId === exerciseFilter)
      if (exercise) {
        return getWorkoutDayColor(exercise.dayId, colorMode)
      }
    }
    return "#FF5733" // Default color
  }, [mainFilter, exerciseFilter, filteredSessions, colorMode])

  // Get exercise name for display
  const exerciseName = useMemo(() => {
    if (exerciseFilter) {
      const exercise = filteredSessions.find((s) => s.exerciseId === exerciseFilter)
      return exercise?.exerciseName || ""
    }
    return mainFilter ? `${mainFilter.charAt(0).toUpperCase() + mainFilter.slice(1)}` : ""
  }, [exerciseFilter, mainFilter, filteredSessions])

  // Format date for display
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

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-zinc-800/95 backdrop-blur-md rounded-lg p-3 shadow-xl border border-zinc-700/50 text-sm">
        <p className="font-medium text-zinc-200 mb-1">{formatFullDate(label)}</p>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColor }}></div>
          <span className="font-medium" style={{ color: chartColor }}>
            {payload[0].value}
          </span>
          <span className="text-zinc-400">kg</span>
        </div>
      </div>
    )
  }

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props
    if (!cx || !cy || !payload) return null

    const isLatest = payload.isLatest || false
    const isHovered = hoveredPoint === index
    const shouldHighlight = isLatest || isHovered
    const dotSize = shouldHighlight ? 6 : 4

    return (
      <g
        onMouseEnter={() => setHoveredPoint(index)}
        onMouseLeave={() => setHoveredPoint(null)}
        style={{ cursor: "pointer" }}
      >
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

        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={chartColor}
          style={{
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: shouldHighlight ? `drop-shadow(0 0 3px ${chartColor})` : "none",
          }}
        />

        {/* Weight label */}
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
      </g>
    )
  }

  // Animation variants
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-xl overflow-hidden border border-zinc-700/30 shadow-xl"
    >
      <div className="bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 rounded-xl overflow-hidden">
        {/* Chart Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/80 to-transparent border-b border-zinc-700/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">{exerciseName}</h3>

              {/* Weight change indicator */}
              {percentChange && (
                <div className="flex items-center gap-1 text-xs">
                  <div
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      Number(percentChange) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    <ChevronUp className={`h-3 w-3 ${Number(percentChange) <= 0 && "rotate-180"}`} />
                    <span>{Math.abs(Number(percentChange))}%</span>
                  </div>
                  <span className="text-zinc-500">since first record</span>
                </div>
              )}
            </div>

            <div className="text-2xl font-bold" style={{ color: chartColor }}>
              {currentWeight} <span className="text-sm font-normal text-zinc-400">kg</span>
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
            <AnimatePresence mode="wait">
              <motion.div
                key={`${timeframe}-${mainFilter}-${exerciseFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
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
                        padding={{ left: 20, right: 20 }}
                      />

                      {/* Tooltip */}
                      <Tooltip content={<CustomTooltip />} cursor={false} />

                      {/* Area under the line */}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="none"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
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
                    <div className="bg-zinc-800/50 px-4 py-3 rounded-lg border border-zinc-700/30">
                      No data available
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
