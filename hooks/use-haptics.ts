"use client"

import { useCallback } from "react"

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error"

export function useHaptics() {
    const trigger = useCallback((pattern: HapticPattern = "light") => {
        if (typeof navigator === "undefined" || !navigator.vibrate) return

        switch (pattern) {
            case "light":
                navigator.vibrate(3) // Soft micro click
                break
            case "medium":
                navigator.vibrate(6) // Gentle tap
                break
            case "heavy":
                navigator.vibrate(12) // Soft press
                break
            case "success":
                navigator.vibrate([6, 20, 10]) // Soft double tap
                break
            case "warning":
                navigator.vibrate([6, 30, 6])
                break
            case "error":
                navigator.vibrate([6, 30, 6, 30, 6])
                break
        }
    }, [])

    return { trigger }
}
