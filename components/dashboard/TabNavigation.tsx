"use client"

import type React from "react"

import { Dumbbell, TrendingUp, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHaptics } from "@/hooks/use-haptics"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { trigger: haptic } = useHaptics()
  const tabs = [
    {
      id: "workout",
      label: "Train",
      icon: Dumbbell,
      ariaLabel: "Navigate to Train tab",
    },
    {
      id: "progress",
      label: "Progress",
      icon: TrendingUp,
      ariaLabel: "Navigate to Progress tab",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      ariaLabel: "Navigate to Settings tab",
    },
  ]

  return (
    <nav
      className={cn(
        "flex w-[240px] h-12 px-1.5 rounded-full border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] gap-1",
        "md:w-[420px] md:px-2"
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => {
              haptic("light")
              onTabChange(tab.id)
            }}
            role="tab"
            className={cn(
              "flex-1 flex flex-row items-center justify-center gap-1.5 px-3 py-1.5 h-9 my-auto rounded-full transition-all duration-200 ease-out select-none cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              isActive 
                ? "bg-zinc-800/90 text-white border border-zinc-700/60 shadow-sm" 
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
            )}
            aria-label={tab.ariaLabel}
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            tabIndex={isActive ? 0 : -1}
          >
            {tab.icon && (
              <tab.icon
                className={cn(
                  "h-[18px] w-[18px] transition-all duration-200 flex-shrink-0",
                  isActive ? "text-white opacity-100" : "text-zinc-400 opacity-70"
                )}
                aria-hidden="true"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
            )}
            <span
              className={cn(
                "hidden md:inline text-xs font-bold tracking-wide transition-all duration-200",
                isActive ? "text-white opacity-100" : "text-zinc-400 opacity-70"
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
