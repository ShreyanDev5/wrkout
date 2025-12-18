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
      ariaLabel: "Workout tab",
      color: "#f9d949", // Yellow for workout
    },
    {
      id: "progress",
      label: "Progress",
      icon: LineChart,
      ariaLabel: "Progress tab",
      color: "#4caf50", // Green for progress
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      ariaLabel: "Settings tab",
      color: "#EA4335", // Red for settings
    },
  ]

  return (
    <div className="grid grid-cols-3 w-full h-16 border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            className={cn(
              "flex flex-col items-center justify-center relative transition-all duration-200",
              isActive ? "tab-active" : "tab-inactive",
            )}
            style={
              {
                "--tab-color": tab.color,
              } as React.CSSProperties
            }
            aria-label={tab.ariaLabel}
            aria-selected={isActive}
            aria-controls={`${tab.id}-tab`}
          >
            <div className="tab-container">
              {tab.icon && (
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive ? "tab-icon-active" : "tab-icon-inactive opacity-50",
                  )}
                  aria-hidden="true"
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    stroke: isActive ? tab.color : "currentColor",
                  }}
                />
              )}
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wide transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-40",
                )}
                style={{
                  color: isActive ? tab.color : undefined,
                }}
              >
                {tab.label}
              </span>
            </div>
            {isActive && (
              <div
                className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 h-0.5 w-8 rounded-full transition-all duration-300"
                style={{ backgroundColor: tab.color }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
