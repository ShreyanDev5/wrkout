"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const AnimatedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    dayColor?: string
  }
>(({ className, dayColor, checked, onCheckedChange, ...props }, ref) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Initialize audio context and sound
  React.useEffect(() => {
    // Create audio element for the tick sound
    const audio = new Audio()
    audio.volume = 0.2 // Set volume to 20%

    // Create a simple tick sound using AudioContext
    const createTickSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.value = 1800 // Higher frequency for a subtle tick
      gainNode.gain.value = 0.1

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create a short tick sound
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)

      // Clean up
      setTimeout(() => {
        audioContext.close()
      }, 200)
    }

    // Store the function for later use
    const playTickSound = () => {
      createTickSound()
    }

    // Expose the function
    ;(window as any).playTickSound = playTickSound

    return () => {
      delete (window as any).playTickSound
    }
  }, [])

  // Handle checkbox change and play sound
  const handleCheckedChange = (isChecked: boolean | "indeterminate") => {
    if (isChecked === true) {
      // Play tick sound when checked
      if ((window as any).playTickSound) {
        ;(window as any).playTickSound()
      }

      // Trigger haptic feedback if supported
      if ("vibrate" in navigator) {
        navigator.vibrate(5) // Very subtle vibration
      }
    }

    // Call the original onCheckedChange handler
    if (onCheckedChange) {
      onCheckedChange(isChecked)
    }
  }

  // Get the appropriate accent color
  const checkboxColor = dayColor || `hsl(var(--accent))`

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-[4px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        checked && "animate-checkbox-subtle",
        className,
      )}
      style={{
        backgroundColor: checked ? checkboxColor : "transparent",
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderWidth: "1.5px",
        borderStyle: "solid",
      }}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "flex items-center justify-center text-background transition-transform duration-200",
          checked ? "scale-100" : "scale-0",
        )}
      >
        <Check className="h-3.5 w-3.5 stroke-[2.5px]" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
AnimatedCheckbox.displayName = "AnimatedCheckbox"

export { AnimatedCheckbox }
