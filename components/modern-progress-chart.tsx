"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp } from "lucide-react"
import { getWorkoutDayColor } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import type { WorkoutSession } from "@/lib/types"
import type { Variants } from "framer-motion"

type TimeframeType = "month" | "threeMonths" | "sixMonths" | "year"

interface ModernProgressChartProps {
  sessions: WorkoutSession[]
  mainFilter: string | null
  exerciseFilter: string | null
}

// Define animation variants outside the component
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const chartVariants: Variants = {
  initial: { opacity: 0.5 },
  hover: { opacity: 1 },
  exit: { opacity: 0 }
}

export function ModernProgressChart({ sessions, mainFilter, exerciseFilter }: ModernProgressChartProps) {
  const { colorMode } = useTheme()
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [isHoveringChart, setIsHoveringChart] = useState(false)

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
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeframe) {
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "threeMonths":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "sixMonths":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
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

  // Calculate percentage change based on timeframe
  const percentChange = useMemo(() => {
    if (chartData.length < 2) return null

    const now = new Date()
    const comparisonDate = new Date()

    // Calculate the comparison date based on timeframe
    switch (timeframe) {
      case "month":
        comparisonDate.setMonth(now.getMonth() - 2) // Previous month
        break
      case "threeMonths":
        comparisonDate.setMonth(now.getMonth() - 6) // Previous three months
        break
      case "sixMonths":
        comparisonDate.setMonth(now.getMonth() - 12) // Previous six months
        break
      case "year":
        comparisonDate.setFullYear(now.getFullYear() - 2) // Previous year
        break
    }

    // Find the closest data point to the comparison date
    const comparisonPoint = chartData.reduce((closest, current) => {
      const currentDate = new Date(current.date)
      const closestDate = new Date(closest.date)
      const currentDiff = Math.abs(currentDate.getTime() - comparisonDate.getTime())
      const closestDiff = Math.abs(closestDate.getTime() - comparisonDate.getTime())
      return currentDiff < closestDiff ? current : closest
    })

    const lastWeight = chartData[chartData.length - 1].weight
    const comparisonWeight = comparisonPoint.weight

    if (comparisonWeight === 0) return null

    const change = ((lastWeight - comparisonWeight) / comparisonWeight) * 100
    return change.toFixed(1)
  }, [chartData, timeframe])

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

  // Enhanced Custom Tooltip component with iOS-like styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    const isPR = data.isPR
    const isLatest = data.isLatest

    return (
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-zinc-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-zinc-700/30 text-sm"
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="space-y-2">
          <p className="font-medium text-zinc-200">{formatFullDate(label)}</p>
          <div className="flex items-center gap-2.5">
            <div 
              className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
              style={{ 
                backgroundColor: chartColor,
                boxShadow: `0 0 8px ${chartColor}40`
              }}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-lg" style={{ color: chartColor }}>
                {payload[0].value}
              </span>
              <span className="text-zinc-400 text-sm">kg</span>
            </div>
          </div>
          {data.reps > 0 && (
            <div className="text-zinc-400 text-sm">
              {data.reps} reps
            </div>
          )}
          {(isPR || isLatest) && (
            <div className="flex items-center gap-2 pt-1">
              {isPR && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  PR
                </span>
              )}
              {isLatest && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  Latest
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Enhanced Custom Dot component with improved hover states
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props
    if (!cx || !cy || !payload) return null

    const isLatest = payload.isLatest || false
    const isPR = payload.isPR || false
    const isHovered = hoveredPoint === index
    const shouldHighlight = isLatest || isHovered || isPR
    const dotSize = shouldHighlight ? 6 : 4

    return (
      <g
        onMouseEnter={() => {
          setHoveredPoint(index)
          setIsHoveringChart(true)
        }}
        onMouseLeave={() => {
          setHoveredPoint(null)
          setIsHoveringChart(false)
        }}
        style={{ cursor: "pointer" }}
      >
        {/* Enhanced glow effect */}
        {shouldHighlight && (
          <motion.circle
            initial={{ r: dotSize + 2, opacity: 0 }}
            animate={{ 
              r: dotSize + 4, 
              opacity: 0.4,
              transition: { duration: 0.2 }
            }}
            cx={cx}
            cy={cy}
            fill="none"
            style={{
              filter: `drop-shadow(0 0 8px ${chartColor})`,
            }}
          />
        )}

        {/* Main dot with enhanced animation */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={chartColor}
          initial={{ scale: 1 }}
          animate={{ 
            scale: shouldHighlight ? 1.2 : 1,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          style={{
            filter: shouldHighlight ? `drop-shadow(0 0 6px ${chartColor})` : "none",
          }}
        />

        {/* Enhanced weight label */}
        {shouldHighlight && (
          <motion.text
            initial={{ opacity: 0, y: -8 }}
            animate={{ 
              opacity: 1, 
              y: -12,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            x={cx}
            y={cy}
            textAnchor="middle"
            fill={chartColor}
            fontSize="11"
            fontWeight="600"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {payload.weight}kg
          </motion.text>
        )}
      </g>
    )
  }

  // Helper function to get the comparison text based on timeframe
  const getComparisonText = (timeframe: TimeframeType): string => {
    switch (timeframe) {
      case "month":
        return "since last month"
      case "threeMonths":
        return "since last 3 months"
      case "sixMonths":
        return "since last 6 months"
      case "year":
        return "since last year"
      default:
        return "since first record"
    }
  }

  // Verify filtering logic with console logs for debugging
  useEffect(() => {
    console.log("Timeframe:", timeframe)
    console.log("Filtered Sessions Count:", timeframeFilteredSessions.length)
    console.log("Date Range:", {
      start: timeframeFilteredSessions[0]?.date,
      end: timeframeFilteredSessions[timeframeFilteredSessions.length - 1]?.date
    })
  }, [timeframe, timeframeFilteredSessions])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-xl overflow-hidden border border-zinc-700/30 shadow-xl"
      onMouseEnter={() => setIsHoveringChart(true)}
      onMouseLeave={() => setIsHoveringChart(false)}
    >
      <div className="bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 rounded-xl overflow-hidden">
        {/* Chart Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/80 to-transparent border-b border-zinc-700/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">{exerciseName}</h3>

              {/* Updated Weight change indicator with dynamic text */}
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
                  <span className="text-zinc-500">{getComparisonText(timeframe)}</span>
                </div>
              )}
            </div>

            <div className="text-2xl font-bold" style={{ color: chartColor }}>
              {currentWeight} <span className="text-sm font-normal text-zinc-400">kg</span>
            </div>
          </div>

          {/* Updated Timeframe Selector */}
          <div className="mt-5">
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeType)} className="w-full">
              <TabsList className="h-9 p-1 bg-zinc-800/70 rounded-full border border-zinc-700/30">
                <TabsTrigger
                  value="month"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="threeMonths"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  Three Months
                </TabsTrigger>
                <TabsTrigger
                  value="sixMonths"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  Six Months
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="text-xs px-4 rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner"
                >
                  One Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Chart Content */}
        <div className="p-0 pt-6">
          <div className="h-[240px] w-full px-4 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${timeframe}-${mainFilter}-${exerciseFilter}`}
                initial="initial"
                animate="hover"
                exit="exit"
                variants={chartVariants}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
              >
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                      onMouseLeave={() => {
                        setHoveredPoint(null)
                        setIsHoveringChart(false)
                      }}
                    >
                      <defs>
                        {/* Enhanced gradient for area under the line */}
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>

                        {/* Enhanced anti-aliasing filter */}
                        <filter id="anti-aliasing" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
                        </filter>

                        {/* Enhanced drop shadow for the line */}
                        <filter id="lineShadow" height="200%">
                          <feDropShadow 
                            dx="0" 
                            dy="2" 
                            stdDeviation="3" 
                            floodColor={chartColor} 
                            floodOpacity="0.2" 
                          />
                        </filter>
                      </defs>

                      {/* Enhanced grid lines */}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                        strokeOpacity={0.2}
                      />

                      {/* Enhanced X-Axis */}
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        tick={{ 
                          fontSize: 11, 
                          fill: "#9ca3af"
                        }}
                        axisLine={{ 
                          stroke: "rgba(255,255,255,0.1)"
                        }}
                        tickLine={false}
                        dy={10}
                        padding={{ left: 20, right: 20 }}
                      />

                      {/* Enhanced Tooltip */}
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={false}
                        isAnimationActive={true}
                        animationDuration={200}
                      />

                      {/* Enhanced Area under the line */}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="none"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />

                      {/* Enhanced Main trend line */}
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
                          strokeLinejoin: "round"
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center h-full text-zinc-400 text-sm"
                  >
                    <div className="bg-zinc-800/50 px-4 py-3 rounded-lg border border-zinc-700/30 backdrop-blur-sm">
                      No data available
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
