"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type ColorMode = "light" | "dark"
type AccentColor = "emerald" | "purple" | "deep-blue"

interface ThemeContextType {
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  isFirstVisit: boolean
  setIsFirstVisit: (isFirst: boolean) => void
}

const ThemeContext = createContext<ThemeContextType>({
  colorMode: "dark",
  setColorMode: () => {},
  accentColor: "emerald",
  setAccentColor: () => {},
  isFirstVisit: false,
  setIsFirstVisit: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>("dark")
  const [accentColor, setAccentColor] = useState<AccentColor>("emerald")
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false)

  useEffect(() => {
    // Always use dark mode
    document.documentElement.classList.add("dark")

    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{ colorMode, setColorMode, accentColor, setAccentColor, isFirstVisit, setIsFirstVisit }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
