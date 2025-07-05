"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp } from "lucide-react"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import type { WorkoutLog } from "@/lib/types"
import type { Variants } from "framer-motion"

type TimeframeType = "month" | "threeMonths" | "sixMonths" | "year"

interface ModernProgressChartProps {
  logs: WorkoutLog[]
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

// Update chart variants for smoother revealing animation
const chartVariants: Variants = {
  initial: { 
    opacity: 0.4,
    clipPath: "inset(0 100% 0 0)"
  },
  hover: { 
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0,
    clipPath: "inset(0 0% 0 100%)",
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

// Move all styles to a single constant at the top level of the component
const chartStyles = `
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }

  .touch-tooltip {
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    transform: none;
    box-sizing: border-box;
    z-index: 1000;
    width: calc(100% - 32px);
    max-width: 320px;
    margin: 0 auto;
    pointer-events: none;
  }

  @media (hover: none) {
    .recharts-wrapper {
      touch-action: pan-x pan-y;
    }
  }
`

export function ModernProgressChart({ logs, mainFilter, exerciseFilter }: ModernProgressChartProps) {
  const { colorMode } = useTheme()
  const [timeframe, setTimeframe] = useState<TimeframeType>("month")
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [isHoveringChart, setIsHoveringChart] = useState(false)
  const [touchedPoint, setTouchedPoint] = useState<number | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)



  // Filter logs by exercise and main filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Apply main filter (workout type)
      if (mainFilter) {
        const exerciseType = getExerciseWorkoutType(log.exercise_name)
        if (exerciseType !== mainFilter.toLowerCase()) return false
      }

      // Apply exercise filter
      if (exerciseFilter && log.exercise_name !== exerciseFilter) return false

      // Only include logs with both weight and avg_reps data
      if (log.weight <= 0 || log.avg_reps <= 0) return false

      return true
    })
  }, [logs, mainFilter, exerciseFilter])

  // Apply timeframe filter
  const timeframeFilteredLogs = useMemo(() => {
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

    return filteredLogs.filter((log) => {
      const logDate = new Date(log.performed_at)
      return logDate >= cutoffDate
    })
  }, [filteredLogs, timeframe])

  // Process data for the chart
  const chartData = useMemo(() => {
    const groupedData: Record<
      string,
      {
        date: string
        weight: number
        exerciseName: string
        avgReps: number
        isLatest: boolean
        isPR: boolean
        index: number
      }
    > = {}

    timeframeFilteredLogs.forEach((log) => {
      const dateKey = log.performed_at
      if (!groupedData[dateKey] || log.weight > groupedData[dateKey].weight) {
        groupedData[dateKey] = {
          date: dateKey,
          weight: log.weight,
          exerciseName: log.exercise_name,
          avgReps: log.avg_reps,
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
  }, [timeframeFilteredLogs])

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
      // 'dayId' does not exist on WorkoutLog, so fallback to default color or handle gracefully
      // Optionally, if you have a way to infer the day type from exercise name, implement here
      // For now, just return the default color
      // const exercise = filteredLogs.find((s) => s.exercise_name === exerciseFilter)
      // if (exercise) {
      //   return getWorkoutDayColor(exercise.dayId, colorMode)
      // }
    }
    return "#FF5733" // Default color
  }, [mainFilter, exerciseFilter, filteredLogs, colorMode])

  // Get exercise name for display
  const exerciseName = useMemo(() => {
    if (exerciseFilter) {
      const exercise = filteredLogs.find((s) => s.exercise_name === exerciseFilter)
      return exercise?.exercise_name || ""
    }
    return mainFilter ? `${mainFilter.charAt(0).toUpperCase() + mainFilter.slice(1)}` : ""
  }, [exerciseFilter, mainFilter, filteredLogs])

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

  // Add useEffect to detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    // Initial check
    checkTouchDevice()
    
    // Add resize listener
    window.addEventListener('resize', checkTouchDevice)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  // Add touch event handlers
  const handleTouchStart = (index: number) => {
    setTouchedPoint(index)
    setHoveredPoint(index)
    setIsHoveringChart(true)
  }

  const handleTouchEnd = () => {
    // Small delay to allow for tap interactions
    setTimeout(() => {
      setTouchedPoint(null)
      setHoveredPoint(null)
      setIsHoveringChart(false)
    }, 2000) // Dismiss after 2 seconds
  }

  // Enhanced Custom Tooltip component with iOS-like styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if ((!active && !touchedPoint) || !payload || !payload.length) return null

    const data = payload[0].payload
    const isPR = data.isPR
    const isLatest = data.isLatest

    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8
        }}
        className={`bg-zinc-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-zinc-700/30 text-sm ${
          isTouchDevice ? 'touch-tooltip' : ''
        }`}
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
          transformOrigin: "center bottom",
          willChange: "transform, opacity",
          touchAction: 'none', // Prevent default touch actions
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

  // Custom Dot component with verified implementation
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (!cx || !cy || !payload) return null

    const isLatest = payload.isLatest || false
    const isPR = payload.isPR || false
    const isHovered = hoveredPoint === index
    const isTouched = touchedPoint === index
    const shouldHighlight = isLatest || isHovered || isPR || isTouched
    const dotSize = shouldHighlight ? 5.5 : 4

    const labelYOffset = isMobile ? -14 : -16
    const labelFontSize = isMobile ? 11 : 15

    return (
      <g
        onMouseEnter={() => {
          if (!isTouchDevice) {
            setHoveredPoint(index)
            setIsHoveringChart(true)
          }
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            setHoveredPoint(null)
            setIsHoveringChart(false)
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault() // Prevent default touch behavior
          handleTouchStart(index)
        }}
        onTouchEnd={(e) => {
          e.preventDefault() // Prevent default touch behavior
          handleTouchEnd()
        }}
        style={{ 
          cursor: isTouchDevice ? 'pointer' : 'default',
          touchAction: 'none' // Prevent default touch actions
        }}
      >
        {/* Base dot */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={chartColor}
          style={{
            opacity: 1,
            stroke: "rgba(255, 255, 255, 0.12)",
            strokeWidth: shouldHighlight ? 1 : 0.5,
          }}
        />

        {/* Highlight effect */}
        {shouldHighlight && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize + 2}
            fill="none"
            style={{
              stroke: chartColor,
              strokeWidth: 1.2,
              opacity: 0.25,
            }}
          />
        )}

        {/* Inner highlight */}
        {(isPR || isLatest) && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize * 0.5}
            fill="rgba(255, 255, 255, 0.6)"
            style={{
              mixBlendMode: "soft-light",
            }}
          />
        )}

        {/* Weight label */}
        {shouldHighlight && (
          <text
            x={cx}
            y={cy + labelYOffset}
            textAnchor="middle"
            fill={chartColor}
            fontSize={labelFontSize}
            fontWeight="600"
            style={{
              paintOrder: "stroke",
              stroke: "rgba(0,0,0,0.2)",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
              zIndex: 1000,
              pointerEvents: 'none', // Prevent text from interfering with touch events
            }}
          >
            {payload.weight}kg
          </text>
        )}
      </g>
    )
  }

  // Verify filtering logic with console logs for debugging
  useEffect(() => {
    console.log("Timeframe:", timeframe)
    console.log("Filtered Sessions Count:", timeframeFilteredLogs.length)
    console.log("Date Range:", {
      start: timeframeFilteredLogs[0]?.performed_at,
      end: timeframeFilteredLogs[timeframeFilteredLogs.length - 1]?.performed_at
    })
  }, [timeframe, timeframeFilteredLogs])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-xl overflow-hidden border border-zinc-700/30 shadow-xl"
      onMouseEnter={() => !isTouchDevice && setIsHoveringChart(true)}
      onMouseLeave={() => !isTouchDevice && setIsHoveringChart(false)}
      style={{ willChange: "transform" }}
    >
      <style jsx global>{chartStyles}</style>
      <div className="bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 rounded-xl overflow-hidden">
        {/* Chart Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/80 to-transparent border-b border-zinc-700/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">{exerciseName}</h3>
            </div>

            {/* Updated Weight change indicator with dynamic text */}
            {percentChange && (
              <div className="flex flex-col items-end gap-0.5">
                <div
                  className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-sm ${
                    Number(percentChange) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  <ChevronUp className={`h-3.5 w-3.5 ${Number(percentChange) <= 0 && "rotate-180"}`} />
                  <span className="font-semibold">{Math.abs(Number(percentChange))}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Updated Timeframe Selector */}
          <div className="mt-5 -ml-1">
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeType)} className="w-full">
              <TabsList className="h-8 p-0.5 bg-zinc-800/70 rounded-full border border-zinc-700/30 overflow-x-auto flex-nowrap scrollbar-none">
                <TabsTrigger
                  value="month"
                  className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 rounded-full data-[state=active]:bg-zinc-700/80 data-[state=active]:shadow-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap min-w-[52px] sm:min-w-[64px] hover:bg-zinc-700/40"
                >
                  1M
                </TabsTrigger>
                <TabsTrigger
                  value="threeMonths"
                  className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 rounded-full data-[state=active]:bg-zinc-700/80 data-[state=active]:shadow-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap min-w-[52px] sm:min-w-[64px] hover:bg-zinc-700/40"
                >
                  3M
                </TabsTrigger>
                <TabsTrigger
                  value="sixMonths"
                  className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 rounded-full data-[state=active]:bg-zinc-700/80 data-[state=active]:shadow-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap min-w-[52px] sm:min-w-[64px] hover:bg-zinc-700/40"
                >
                  6M
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 rounded-full data-[state=active]:bg-zinc-700/80 data-[state=active]:shadow-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap min-w-[52px] sm:min-w-[64px] hover:bg-zinc-700/40"
                >
                  1Y
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Chart Content */}
        <div className="p-0 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <div className="h-[220px] sm:h-[240px] w-full px-4 mt-2 sm:mt-0">
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
                      margin={{ top: 35, right: 10, left: 10, bottom: 12 }}
                      onMouseLeave={() => {
                        setHoveredPoint(null)
                        setIsHoveringChart(false)
                      }}
                    >
                      <defs>
                        {/* Simple gradient for area */}
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                        strokeOpacity={0.2}
                      />

                      {/* X-Axis */}
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

                      {/* Tooltip */}
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={false}
                      />

                      {/* Main trend line with smoother revealing animation */}
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={chartColor}
                        strokeWidth={2}
                        dot={<CustomDot />}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        connectNulls={true}
                        style={{
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          opacity: 1
                        }}
                      />

                      {/* Area under the line with smoother revealing animation */}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="none"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        animationDuration={1200}
                        animationEasing="ease-out"
                        style={{
                          opacity: 0.8
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
