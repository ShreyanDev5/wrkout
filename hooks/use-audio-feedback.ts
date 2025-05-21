"use client"
import { useEffect, useRef, useState } from "react"
import {
  initAudioSystem,
  playSound,
  isAudioSupported,
  triggerHapticFeedback,
  ensureAudioContextRunning,
} from "@/lib/audio-utils"

interface AudioFeedbackOptions {
  volume?: number
  visualFeedback?: boolean
  hapticFeedback?: boolean
  debounceMs?: number
}

export function useAudioFeedback({
  volume = 0.4,
  visualFeedback = true,
  hapticFeedback = true,
  debounceMs = 50,
}: AudioFeedbackOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const lastPlayTimeRef = useRef(0)
  const isMountedRef = useRef(true)

  // Initialize audio system on mount
  useEffect(() => {
    if (!isAudioSupported()) return

    // Initialize the audio system
    initAudioSystem()

    // Try to ensure audio context is running
    ensureAudioContextRunning()
      .then((success) => {
        if (isMountedRef.current) {
          setAudioReady(success)
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setAudioReady(false)
        }
      })

    // Set up event listeners to resume audio context on user interaction
    const handleUserInteraction = () => {
      ensureAudioContextRunning()
        .then((success) => {
          if (isMountedRef.current) {
            setAudioReady(success)
          }
        })
        .catch(() => {})
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    // Cleanup function
    return () => {
      isMountedRef.current = false
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [])

  // Function to play sound with debouncing
  const playFeedback = () => {
    const now = Date.now()

    // Debounce sound playback to prevent rapid firing
    if (now - lastPlayTimeRef.current < debounceMs) {
      return
    }

    lastPlayTimeRef.current = now

    // Set visual feedback state
    if (visualFeedback) {
      setIsPlaying(true)
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsPlaying(false)
        }
      }, 150)
    }

    // Try to play sound
    const soundPlayed = playSound(volume)

    // If sound failed and haptic feedback is enabled, try haptic feedback
    if (!soundPlayed && hapticFeedback) {
      triggerHapticFeedback()
    }
  }

  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    playSound: playFeedback,
    isPlaying,
    audioReady,
  }
}
