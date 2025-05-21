"use client"

import { useState, useEffect } from "react"

export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    // Function to check if the device is mobile based on window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape")
    }

    // Check on mount
    checkMobile()

    // Add event listeners for window resize and orientation change
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [breakpoint])

  return { isMobile, orientation }
}
