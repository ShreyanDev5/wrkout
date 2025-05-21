/**
 * Enhanced audio feedback utility with improved reliability
 */

// Singleton audio context to prevent multiple instances
let audioContextInstance: AudioContext | null = null
let audioInitialized = false
let audioEnabled = true

// Get or create the audio context
export function getAudioContext(): AudioContext | null {
  if (!audioContextInstance) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContextInstance = new AudioContextClass()
      }
    } catch (error) {
      console.warn("AudioContext not supported:", error)
      return null
    }
  }

  return audioContextInstance
}

// Resume audio context if it's suspended (needed for browsers that suspend on creation)
export function ensureAudioContextRunning(): Promise<boolean> {
  const ctx = getAudioContext()
  if (!ctx) return Promise.resolve(false)

  if (ctx.state === "suspended") {
    return ctx
      .resume()
      .then(() => true)
      .catch((error) => {
        console.warn("Failed to resume audio context:", error)
        return false
      })
  }

  return Promise.resolve(ctx.state === "running")
}

// Create a simple tick sound using the audio context
export function playTickSound(volume = 0.2): boolean {
  if (!audioEnabled) return false

  const ctx = getAudioContext()
  if (!ctx) return false

  try {
    // Ensure the context is running
    if (ctx.state !== "running") {
      ensureAudioContextRunning().catch(() => {})
      // Still try to play the sound even if resuming fails
    }

    // Create oscillator and gain nodes
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Configure the sound
    oscillator.type = "sine"
    oscillator.frequency.value = 800
    gainNode.gain.value = volume

    // Connect the nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Create a short tick sound
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    // Play the sound
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.1)

    // Trigger haptic feedback if available
    if ("vibrate" in navigator) {
      navigator.vibrate(5)
    }

    return true
  } catch (error) {
    console.warn("Failed to play tick sound:", error)
    return false
  }
}

// Preloaded audio element for fallback
let fallbackAudio: HTMLAudioElement | null = null

// Initialize the fallback audio
export function initFallbackAudio(): void {
  if (fallbackAudio) return

  try {
    fallbackAudio = new Audio()
    fallbackAudio.volume = 0.2

    // Try to load from public directory first
    fallbackAudio.src = "/sounds/tick.mp3"

    // Add error handler to switch to embedded audio if needed
    fallbackAudio.addEventListener("error", () => {
      if (fallbackAudio) {
        // Base64 encoded small tick sound
        fallbackAudio.src =
          "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA8DcWTzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="
      }
    })

    // Preload the audio
    fallbackAudio.load()

    // Add a play attempt on user interaction to unlock audio
    const unlockAudio = () => {
      if (fallbackAudio) {
        // Set current time to 0 to ensure it plays from the beginning
        fallbackAudio.currentTime = 0

        // Play and immediately pause to unlock audio
        const playPromise = fallbackAudio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              fallbackAudio?.pause()
              audioInitialized = true
            })
            .catch((error) => {
              console.warn("Audio play failed:", error)
            })
        }
      }

      // Also try to resume the audio context
      ensureAudioContextRunning().catch(() => {})

      // Remove the event listeners after first interaction
      document.removeEventListener("click", unlockAudio)
      document.removeEventListener("touchstart", unlockAudio)
    }

    // Add event listeners to unlock audio on first interaction
    document.addEventListener("click", unlockAudio)
    document.addEventListener("touchstart", unlockAudio)
  } catch (error) {
    console.warn("Failed to initialize fallback audio:", error)
    fallbackAudio = null
  }
}

// Play the fallback audio
export function playFallbackAudio(): boolean {
  if (!audioEnabled || !fallbackAudio) return false

  try {
    // Reset to beginning
    fallbackAudio.currentTime = 0

    // Play the sound
    const playPromise = fallbackAudio.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Fallback audio play failed:", error)

        // If playing fails, try to resume the audio context and play a Web Audio API sound
        ensureAudioContextRunning()
          .then(() => playTickSound())
          .catch(() => {})
      })
    }

    // Trigger haptic feedback if available
    if ("vibrate" in navigator) {
      navigator.vibrate(5)
    }

    return true
  } catch (error) {
    console.warn("Failed to play fallback audio:", error)
    return false
  }
}

// Play sound with multiple fallbacks
export function playSound(volume = 0.2): boolean {
  if (!audioEnabled) return false

  // Try Web Audio API first
  if (playTickSound(volume)) {
    return true
  }

  // Fall back to audio element if Web Audio API fails
  if (playFallbackAudio()) {
    return true
  }

  // Last resort: just vibrate if available
  if ("vibrate" in navigator) {
    navigator.vibrate(10)
    return true
  }

  return false
}

// Initialize audio system
export function initAudioSystem(): void {
  // Initialize both audio systems
  getAudioContext()
  initFallbackAudio()

  // Try to resume audio context on initialization
  ensureAudioContextRunning().catch(() => {})
}

// Enable/disable audio
export function setAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled
}

// Check if audio is supported
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext || typeof Audio !== "undefined")
}

// Check if vibration is supported
export function isVibrationSupported(): boolean {
  return typeof window !== "undefined" && "vibrate" in navigator
}

// Trigger haptic feedback if available
export function triggerHapticFeedback(duration = 10): boolean {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(duration)
      return true
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
    }
  }
  return false
}

// Clean up audio resources
export function cleanupAudio(): void {
  if (audioContextInstance) {
    audioContextInstance.close().catch(() => {})
    audioContextInstance = null
  }

  if (fallbackAudio) {
    fallbackAudio.pause()
    fallbackAudio.src = ""
    fallbackAudio = null
  }
}
