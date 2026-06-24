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
      className={cn(
        "flex w-full max-w-[420px] h-12 px-1.5 rounded-full border border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] gap-1",
        "md:w-[460px] md:px-2"
      )}
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
              "flex-1 flex flex-row items-center justify-center gap-1.5 px-3 py-1.5 h-8 my-auto rounded-full transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              isActive 
                ? "bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-foreground" 
                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
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
                  "h-[16px] w-[16px] md:h-[18px] md:w-[18px] transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-45 md:opacity-60",
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
                "text-[10px] md:text-xs font-semibold tracking-wide transition-all duration-200",
                isActive ? "opacity-100" : "opacity-45 md:opacity-60",
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
