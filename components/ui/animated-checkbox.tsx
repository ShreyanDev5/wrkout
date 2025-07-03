"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const AnimatedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    dayColor?: string
    onClick?: () => void
  }
>(({ className, dayColor, checked, onClick, ...props }, ref) => {
  // Initialize audio context and sound
  React.useEffect(() => {
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
    ;(window as any).playTickSound = createTickSound

    return () => {
      delete (window as any).playTickSound
    }
  }, [])

  // Get the appropriate accent color
  const checkboxColor = dayColor || `hsl(var(--accent))`

  return (
    <div className="relative flex items-center justify-center" onClick={onClick}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-[3px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          "border border-border/40 hover:border-border/60",
          checked && "animate-checkbox-subtle shadow-sm",
          className,
        )}
        style={{
          backgroundColor: checked ? checkboxColor : "transparent",
          boxShadow: checked ? `0 0 0 1px ${checkboxColor}, 0 2px 4px rgba(0, 0, 0, 0.1)` : "none",
        }}
        checked={checked}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            "flex items-center justify-center text-background transition-all duration-200",
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        >
          <Check className="h-3 w-3 stroke-[2px]" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {/* Touch target overlay for better mobile accessibility */}
      <div className="absolute inset-0 -m-2 min-touch-target" />
    </div>
  )
})
AnimatedCheckbox.displayName = "AnimatedCheckbox"

export { AnimatedCheckbox }
