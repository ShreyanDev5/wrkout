"use client"

import { ReactNode, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CollapsibleHeaderLayoutProps {
  children: ReactNode
  header: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  initialHeaderHeight?: number
  collapseThreshold?: number
  onScroll?: (scrollProgress: number) => void
}

export function CollapsibleHeaderLayout({
  children,
  header,
  className,
  headerClassName,
  contentClassName,
  initialHeaderHeight = 120,
  collapseThreshold = 50,
  onScroll,
}: CollapsibleHeaderLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    container: containerRef,
  })

  // Transform scroll progress into header animations
  const headerOpacity = useTransform(scrollY, [0, collapseThreshold], [1, 0.95])
  const headerScale = useTransform(scrollY, [0, collapseThreshold], [1, 0.98])
  const headerY = useTransform(scrollY, [0, collapseThreshold], [0, -10])
  const contentY = useTransform(scrollY, [0, collapseThreshold], [0, -initialHeaderHeight])

  // Notify parent of scroll progress
  useEffect(() => {
    if (onScroll) {
      const unsubscribe = scrollY.onChange((latest) => {
        const progress = Math.min(latest / collapseThreshold, 1)
        onScroll(progress)
      })
      return () => unsubscribe()
    }
  }, [scrollY, collapseThreshold, onScroll])

  return (
    <Card className={cn("border-0 shadow-none dark:bg-background h-[calc(100vh-4rem)] overflow-hidden", className)}>
      <CardHeader 
        className={cn(
          "sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 sm:px-6 pb-4",
          headerClassName
        )}
      >
        <motion.div
          style={{
            opacity: headerOpacity,
            scale: headerScale,
            y: headerY,
          }}
          className="relative"
        >
          {header}
        </motion.div>
      </CardHeader>

      <CardContent 
        ref={containerRef}
        className={cn(
          "h-[calc(100%-120px)] overflow-y-auto px-4 sm:px-6 pt-4",
          contentClassName
        )}
      >
        <motion.div
          style={{
            y: contentY,
          }}
          className="relative"
        >
          {children}
        </motion.div>
      </CardContent>
    </Card>
  )
} 