"use client"

import type React from "react"

import { Dumbbell, LineChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: "workout",
      label: "Workout",
      icon: Dumbbell,
      ariaLabel: "Navigate to Workout tab",
      color: "#f9d949", // Yellow for workout
    },
    {
      id: "progress",
      label: "Progress",
      icon: LineChart,
      ariaLabel: "Navigate to Progress tab",
      color: "#4caf50", // Green for progress
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      ariaLabel: "Navigate to Settings tab",
      color: "#EA4335", // Red for settings
    },
  ]

  return (
    <nav
      className="grid grid-cols-3 w-full h-[60px] border-t border-zinc-800/40 bg-[#1a1a1a]"
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            className={cn(
              "flex flex-col items-center justify-center gap-1 relative",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
              isActive ? "focus-visible:ring-current" : "focus-visible:ring-zinc-500",
            )}
            style={
              {
                "--tab-color": tab.color,
              } as React.CSSProperties
            }
            aria-label={tab.ariaLabel}
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            tabIndex={isActive ? 0 : -1}
          >
            {tab.icon && (
              <tab.icon
                className={cn(
                  "h-[22px] w-[22px] transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-45",
                )}
                aria-hidden="true"
                strokeWidth={isActive ? 2.25 : 1.75}
                style={{
                  color: isActive ? tab.color : "currentColor",
                }}
              />
            )}
            <span
              className={cn(
                "text-[10px] font-semibold tracking-wide transition-all duration-200",
                isActive ? "opacity-100" : "opacity-45",
              )}
              style={{
                color: isActive ? tab.color : undefined,
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
