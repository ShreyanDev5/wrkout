"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp } from "lucide-react"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { useIsMobile } from "@/components/ui/use-mobile"
import type { WorkoutLog } from "@/lib/types"
import type { Variants } from "framer-motion"

type TimeframeType = "month" | "threeMonths" | "sixMonths" | "year" | "fiveYears" | "all"

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
    opacity: 0.3,
    clipPath: "inset(0 100% 0 0)",
    filter: "blur(4px)"
  },
  hover: { 
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0,
    clipPath: "inset(0 0% 0 100%)",
    filter: "blur(4px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

  // Move all styles to a single constant at the top level of the component
const chartStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .timeframe-button {
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .timeframe-button-active {
    transform: scale(1.05);
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
    max-width: 260px;
    margin: 0 auto;
    pointer-events: none;
  }

  @media (hover: none) {
    .recharts-wrapper {
      touch-action: pan-x pan-y;
    }
  }
  
  /* Mobile-optimized timeframe selector */
  .mobile-timeframe-container {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .mobile-timeframe-scroll {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 4px 0;
    width: 100%;
  }
  
  .mobile-timeframe-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .mobile-timeframe-buttons {
    display: flex;
    gap: 5px;
    padding: 0 2px;
  }
  
  .mobile-timeframe-button {
    flex: 0 0 auto;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 9999px;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    border: 1px solid;
    white-space: nowrap;
    min-width: 36px;
  }
  
  .mobile-timeframe-button.active {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    transform: scale(1.05);
  }
  
  /* Change indicator */
  .change-indicator {
    display: flex;
    align-items: center;
    gap: 2px;
    border-radius: 9999px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 8px;
  }
  
  /* Chart container spacing */
  .chart-container {
    padding-top: 16px;
    background: linear-gradient(to bottom, rgba(26, 26, 26, 0.5), transparent); /* Subtle gradient for depth */
  }
  
  @media (max-width: 640px) {
    .chart-container {
      padding-top: 20px;
    }
  }
  
  /* Compact mobile tooltip */
  @media (max-width: 640px) {
    .compact-mobile-tooltip {
      padding: 10px 14px !important;
      width: calc(100% - 32px) !important;
      max-width: 260px !important;
    }
  }
`

export function ModernProgressChart({ logs, mainFilter, exerciseFilter }: ModernProgressChartProps) {
  const { colorMode } = useTheme()
  const isMobile = useIsMobile()
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
      case "fiveYears":
        cutoffDate.setFullYear(now.getFullYear() - 5)
        break
      case "all":
        // For "all", we don't set a cutoff date, so we return all logs
        return filteredLogs
    }

    // For all timeframes except "all", filter by cutoff date
    return filteredLogs.filter((log) => {
      const logDate = new Date(log.performed_at)
      return logDate >= cutoffDate
    })
  }, [filteredLogs, timeframe])

  // Process data for the chart
  const chartData = useMemo(() => {
    try {
      // If we have an exercise filter, only show that exercise
      // If we have a main filter but no exercise filter, group by exercise and show the best progression
      let processedLogs: WorkoutLog[] = timeframeFilteredLogs

      if (exerciseFilter) {
        // Show only the selected exercise
        processedLogs = timeframeFilteredLogs.filter(log => log.exercise_name === exerciseFilter)
      } else if (mainFilter) {
        // For main filter only, filter logs by workout type first
        processedLogs = timeframeFilteredLogs.filter(log => {
          const exerciseType = getExerciseWorkoutType(log.exercise_name)
          return exerciseType === mainFilter.toLowerCase()
        })
        
        // Then group by exercise and find the best progression
        const exerciseGroups: Record<string, WorkoutLog[]> = {}
        
        processedLogs.forEach(log => {
          if (!exerciseGroups[log.exercise_name]) {
            exerciseGroups[log.exercise_name] = []
          }
          exerciseGroups[log.exercise_name].push(log)
        })
        
        // Find the exercise with the most data points or best progression
        let bestExercise = ""
        let maxDataPoints = 0
        
        Object.entries(exerciseGroups).forEach(([exerciseName, logs]) => {
          if (logs.length > maxDataPoints) {
            maxDataPoints = logs.length
            bestExercise = exerciseName
          }
        })
        
        if (bestExercise) {
          processedLogs = exerciseGroups[bestExercise]
        }
      }

      // If no data after filtering, return empty array
      if (processedLogs.length === 0) {
        return []
      }

      // Group by date and keep the best volume (weight * reps) for each date
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

      processedLogs.forEach((log) => {
        const dateKey = log.performed_at
        const currentVolume = log.weight * log.avg_reps
        const existingVolume = groupedData[dateKey] ? groupedData[dateKey].weight * groupedData[dateKey].avgReps : 0
        
        if (!groupedData[dateKey] || currentVolume > existingVolume) {
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

      // Find the max volume (weight * reps) for PR identification
      const maxVolume = sortedData.length > 0 ? Math.max(...sortedData.map((item) => item.weight * item.avgReps)) : 0

      // Mark the latest entry and PR
      if (sortedData.length > 0) {
        // Mark the latest entry
        sortedData[sortedData.length - 1].isLatest = true

        // Mark all PR entries (based on volume)
        sortedData.forEach((item) => {
          const itemVolume = item.weight * item.avgReps;
          if (itemVolume === maxVolume) {
            item.isPR = true
          }
        })
      }

      return sortedData
    } catch (error) {
      return []
    }
  }, [timeframeFilteredLogs, exerciseFilter, mainFilter])

  // Calculate stats based on volume (weight × reps) for more comprehensive tracking
  const personalRecord = chartData.length ? Math.max(...chartData.map((item) => item.weight * item.avgReps)) : 0
  const minWeight = chartData.length ? Math.max(0, Math.min(...chartData.map((item) => item.weight)) - 5) : 0
  const currentWeight = chartData.length ? chartData[chartData.length - 1].weight : 0

  // Calculate percentage change based on timeframe - enhanced to consider volume (weight × reps)
  const percentChange = useMemo(() => {
    if (chartData.length < 2) return null;

    // Compare the latest value to the earliest value within the filtered timeframe
    const earliestWeight = chartData[0].weight;
    const latestWeight = chartData[chartData.length - 1].weight;
    
    // Calculate volume (weight × reps) for more comprehensive progress tracking
    const earliestVolume = chartData[0].weight * chartData[0].avgReps;
    const latestVolume = chartData[chartData.length - 1].weight * chartData[chartData.length - 1].avgReps;

    // Use volume for percentage calculation if both volumes are available
    if (earliestVolume > 0 && latestVolume > 0 && earliestVolume !== latestVolume) {
      const change = ((latestVolume - earliestVolume) / earliestVolume) * 100;
      return change.toFixed(1);
    }
    
    // Fallback to weight-only calculation if volume data is incomplete
    if (earliestWeight === 0 || earliestWeight === latestWeight) return null;

    const change = ((latestWeight - earliestWeight) / earliestWeight) * 100;
    return change.toFixed(1);
  }, [chartData]);

  // Get color based on day type
  const chartColor = useMemo(() => {
    if (mainFilter) {
      return getWorkoutDayColor(mainFilter, colorMode)
    } else if (exerciseFilter) {
      // Get the workout type from the exercise name
      const exerciseType = getExerciseWorkoutType(exerciseFilter)
      if (exerciseType) {
        return getWorkoutDayColor(exerciseType, colorMode)
      }
    } else if (chartData.length > 0) {
      // Get the workout type from the first exercise in the chart
      const exerciseType = getExerciseWorkoutType(chartData[0].exerciseName)
      if (exerciseType) {
        return getWorkoutDayColor(exerciseType, colorMode)
      }
    }
    return "#FF5733" // Default color
  }, [mainFilter, exerciseFilter, chartData, colorMode])

  // Get exercise name for display
  const exerciseName = useMemo(() => {
    if (exerciseFilter) {
      return exerciseFilter
    }
    if (mainFilter) {
      return `${mainFilter.charAt(0).toUpperCase() + mainFilter.slice(1)}`
    }
    if (chartData.length > 0) {
      return chartData[0].exerciseName
    }
    return "Progress"
  }, [exerciseFilter, mainFilter, chartData])

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
    // For better UX, we'll keep the tooltip visible until the user interacts elsewhere
    // The tooltip will be dismissed when the user taps outside the chart or taps another point
  }

  // Add a handler to dismiss tooltip when tapping outside the chart
  const handleChartContainerTouch = (e: React.TouchEvent) => {
    // If touching outside a data point, dismiss tooltip
    if (touchedPoint !== null && e.target === e.currentTarget) {
      setTouchedPoint(null)
      setHoveredPoint(null)
      setIsHoveringChart(false)
    }
  }

  // Enhanced Custom Tooltip component with iOS-like styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if ((!active && !touchedPoint) || !payload || !payload.length) return null

    const data = payload[0].payload
    const isPR = data.isPR
    const isLatest = data.isLatest

    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ 
          type: "spring",
          stiffness: 600,
          damping: 35,
          mass: 0.7
        }}
        className={`rounded-2xl p-4 text-sm backdrop-blur-2xl ${
          isTouchDevice ? 'touch-tooltip compact-mobile-tooltip' : ''
        }`}
        style={{
          backgroundColor: "rgba(24, 24, 24, 0.98)", // Increased opacity for better readability
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          transformOrigin: "center bottom",
          willChange: "transform, opacity",
          touchAction: 'none', // Prevent default touch actions
        }}
      >
        <div className="space-y-2">
          <p className="font-medium text-white text-sm">{formatFullDate(label)}</p>
          <div className="flex items-center gap-2.5">
            <div 
              className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
              style={{ 
                backgroundColor: chartColor,
                boxShadow: `0 0 8px ${chartColor}60`
              }}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg" style={{ color: chartColor }}>
                {payload[0].value}
              </span>
              <span className="text-white/70 text-xs">kg</span>
            </div>
          </div>
          {data.avgReps > 0 && (
            <div className="text-white/70 text-xs font-medium">
              {data.avgReps} reps
            </div>
          )}
          {(isPR || isLatest) && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {isPR && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/25 text-green-300 border border-green-500/30">
                  PR
                </span>
              )}
              {isLatest && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/25 text-blue-300 border border-blue-500/30">
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
    const dotSize = shouldHighlight ? 6 : 4.5

    const labelYOffset = isMobile ? -16 : -18
    const labelFontSize = isMobile ? 12 : 16

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
          e.stopPropagation() // Prevent event bubbling
          handleTouchStart(index)
        }}
        onTouchEnd={(e) => {
          e.preventDefault() // Prevent default touch behavior
          e.stopPropagation() // Prevent event bubbling
          // Dismiss tooltip when touching outside of a dot
          if (touchedPoint === index) {
            setTouchedPoint(null)
            setHoveredPoint(null)
            setIsHoveringChart(false)
          }
        }}
        onClick={() => {
          // Toggle tooltip visibility on click/tap for better touch support
          if (isTouchDevice) {
            if (touchedPoint === index) {
              // If tapping the same point, dismiss tooltip
              setTouchedPoint(null)
              setHoveredPoint(null)
              setIsHoveringChart(false)
            } else {
              // If tapping a different point, show tooltip for that point
              handleTouchStart(index)
            }
          }
        }}
        style={{ 
          cursor: isTouchDevice ? 'pointer' : 'default',
          touchAction: 'none' // Prevent default touch actions
        }}
      >
        {/* Base dot with iOS-like styling */}
        <circle
          cx={cx}
          cy={cy}
          r={dotSize}
          fill={chartColor}
          style={{
            opacity: 1,
            stroke: "rgba(255, 255, 255, 0.2)",
            strokeWidth: shouldHighlight ? 1.5 : 0.8,
            filter: shouldHighlight ? "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" : "none",
          }}
        />

        {/* Highlight effect with smoother animation */}
        {shouldHighlight && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize + 3}
            fill="none"
            style={{
              stroke: chartColor,
              strokeWidth: 1.5,
              opacity: 0.3,
              filter: "blur(1px)",
            }}
          />
        )}

        {/* Inner highlight for PR/Latest */}
        {(isPR || isLatest) && (
          <circle
            cx={cx}
            cy={cy}
            r={dotSize * 0.6}
            fill="rgba(255, 255, 255, 0.8)"
            style={{
              mixBlendMode: "screen",
            }}
          />
        )}

        {/* Weight label with improved visibility */}
        {shouldHighlight && (
          <text
            x={cx}
            y={cy + labelYOffset}
            textAnchor="middle"
            fill="white"
            fontSize={labelFontSize}
            fontWeight="600"
            style={{
              paintOrder: "stroke",
              stroke: "rgba(0,0,0,0.5)",
              strokeWidth: 3,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
              zIndex: 1000,
              pointerEvents: 'none', // Prevent text from interfering with touch events
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {payload.weight}kg
          </text>
        )}
      </g>
    )
  }

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // console.log("Progress Chart - Data Points:", chartData.length)
    }
  }, [chartData])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      onMouseEnter={() => !isTouchDevice && setIsHoveringChart(true)}
      onMouseLeave={() => !isTouchDevice && setIsHoveringChart(false)}
      onTouchStart={handleChartContainerTouch}
      style={{ 
        willChange: "transform",
        background: "linear-gradient(135deg, rgba(24, 24, 24, 0.85), rgba(18, 18, 18, 0.85))", // Premium dark gradient matching tooltip
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border for iOS-like effect
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)" // Enhanced shadow for depth
      }}
    >
      <style jsx global>{chartStyles}</style>
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#141414] rounded-xl overflow-hidden">
        {/* Chart Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-[#1a1a1a] to-[#181818]">
          {/* Timeframe Selector */}
          {isMobile ? (
            // Mobile-optimized selector with horizontal scrolling
            <div className="mobile-timeframe-container">
              <div className="mobile-timeframe-scroll scrollbar-hide">
                <div className="mobile-timeframe-buttons">
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`mobile-timeframe-button ${
                      timeframe === "month"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => setTimeframe("threeMonths")}
                    className={`mobile-timeframe-button ${
                      timeframe === "threeMonths"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setTimeframe("sixMonths")}
                    className={`mobile-timeframe-button ${
                      timeframe === "sixMonths"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`mobile-timeframe-button ${
                      timeframe === "year"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    1Y
                  </button>
                  <button
                    onClick={() => setTimeframe("fiveYears")}
                    className={`mobile-timeframe-button ${
                      timeframe === "fiveYears"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    5Y
                  </button>
                  <button
                    onClick={() => setTimeframe("all")}
                    className={`mobile-timeframe-button ${
                      timeframe === "all"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {/* Weight change indicator - placed after timeframe selector for mobile */}
              {percentChange && (
                <div className={`change-indicator ${
                    Number(percentChange) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  <ChevronUp className={`h-3 w-3 ${Number(percentChange) <= 0 && "rotate-180"}`} />
                  <span>{Math.abs(Number(percentChange))}%</span>
                </div>
              )}
            </div>
          ) : (
            // Desktop selector - using mobile design for consistency
            <div className="mobile-timeframe-container w-full">
              <div className="mobile-timeframe-scroll scrollbar-hide">
                <div className="mobile-timeframe-buttons">
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`mobile-timeframe-button ${
                      timeframe === "month"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => setTimeframe("threeMonths")}
                    className={`mobile-timeframe-button ${
                      timeframe === "threeMonths"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setTimeframe("sixMonths")}
                    className={`mobile-timeframe-button ${
                      timeframe === "sixMonths"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`mobile-timeframe-button ${
                      timeframe === "year"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    1Y
                  </button>
                  <button
                    onClick={() => setTimeframe("fiveYears")}
                    className={`mobile-timeframe-button ${
                      timeframe === "fiveYears"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    5Y
                  </button>
                  <button
                    onClick={() => setTimeframe("all")}
                    className={`mobile-timeframe-button ${
                      timeframe === "all"
                        ? "bg-[#2a2a2a] text-foreground border-white/10 active"
                        : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#252525] border-white/5"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {/* Weight change indicator - placed after timeframe selector for mobile */}  
              {percentChange && (
                <div className={`change-indicator ${
                    Number(percentChange) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  <ChevronUp className={`h-3 w-3 ${Number(percentChange) <= 0 && "rotate-180"}`} />
                  <span>{Math.abs(Number(percentChange))}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Chart Content with adjusted height for longer timeframes */}
        <div className="chart-container">
          <div className="h-[180px] sm:h-[220px] w-full px-3"> {/* Increased padding for better spacing */}
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
                        // On mobile, also clear touched point when leaving chart area
                        if (isTouchDevice) {
                          setTouchedPoint(null)
                        }
                      }}
                    >
                      <defs>
                        {/* Premium gradient for area with multiple stops */}
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                          <stop offset="50%" stopColor={chartColor} stopOpacity={0.12} />
                          <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
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
                        strokeWidth={3}
                        dot={<CustomDot />}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        connectNulls={true}
                        style={{
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          opacity: 1,
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
                        }}
                      />

                      {/* Area under the line with smoother revealing animation */}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="none"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                        style={{
                          opacity: 0.7
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
