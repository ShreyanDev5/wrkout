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
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm" />
      
      {/* Content container */}
      <Card className={cn("relative border-0 shadow-none h-full", className)}>
        {/* Main scrollable container */}
        <div 
          ref={containerRef}
          className="h-full overflow-y-auto overflow-x-hidden ios-scroll"
        >
          {/* Header section that collapses on scroll */}
          <motion.div
            style={{
              opacity: headerOpacity,
              scale: headerScale,
              y: headerY,
            }}
            className="relative"
          >
            <CardHeader 
              className={cn(
                "bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 sm:px-6 pb-4",
                headerClassName
              )}
            >
              {header}
            </CardHeader>
          </motion.div>

          {/* Scrollable content */}
          <CardContent 
            className={cn(
              "px-4 sm:px-6 pt-4",
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
        </div>
      </Card>

      {/* Add global scrollbar styles */}
      <style jsx global>{`
        /* iOS-like momentum scrolling */
        .ios-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          overscroll-behavior-y: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .ios-scroll::-webkit-scrollbar {
          display: none;
        }

        /* Enable momentum scrolling on iOS */
        @supports (-webkit-touch-callout: none) {
          .ios-scroll {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Smooth scrolling for all browsers */
        @media (prefers-reduced-motion: no-preference) {
          .ios-scroll {
            scroll-behavior: smooth;
          }
        }

        /* Ensure proper touch handling */
        .ios-scroll {
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }

        /* Prevent scroll chaining */
        .ios-scroll {
          overscroll-behavior-y: contain;
        }

        /* Ensure proper table layout */
        .ios-scroll table {
          width: 100%;
          table-layout: fixed;
        }

        /* Ensure proper sticky positioning */
        .ios-scroll .sticky {
          position: sticky;
          z-index: 10;
          background-color: hsl(var(--background));
        }

        /* Ensure proper header transitions */
        .ios-scroll .motion-div {
          will-change: transform, opacity;
          transform-origin: top center;
        }

        /* Ensure proper content spacing */
        .ios-scroll .space-y-12 > * + * {
          margin-top: 3rem;
        }

        /* Ensure proper header backdrop */
        .ios-scroll .bg-background\/80 {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* Ensure proper motion transitions */
        .ios-scroll .motion-div {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                     opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Ensure proper content transitions */
        .ios-scroll .motion-div[style*="y"] {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
} 