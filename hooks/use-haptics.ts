"use client"

import { useCallback } from "react"

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error"

export function useHaptics() {
    const trigger = useCallback((pattern: HapticPattern = "light") => {
        if (typeof navigator === "undefined" || !navigator.vibrate) return

        switch (pattern) {
            case "light":
                navigator.vibrate(5) // Subtle click
                break
            case "medium":
                navigator.vibrate(10) // Standard tap
                break
            case "heavy":
                navigator.vibrate(20) // Firm press
                break
            case "success":
                navigator.vibrate([10, 30, 20]) // Da-da (Success check)
                break
            case "warning":
                navigator.vibrate([10, 50, 10]) // Uh-oh
                break
            case "error":
                navigator.vibrate([10, 50, 10, 50, 10]) // No-no-no
                break
        }
    }, [])

    return { trigger }
}
