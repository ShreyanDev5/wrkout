"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

import { Check, Trash2 } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Smooth dismiss when clicking anywhere outside an active toast
  React.useEffect(() => {
    const hasOpenToast = toasts.some((t) => t.open !== false)
    if (!hasOpenToast) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-toast-root]") || target?.closest("[data-radix-toast-root]")) {
        return
      }
      dismiss()
    }

    window.addEventListener("pointerdown", handlePointerDown, true)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true)
    }
  }, [toasts, dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"
        const hasAction = Boolean(action)
        return (
          <Toast
            key={id}
            variant={variant}
            className={hasAction ? "w-[92vw] max-w-[390px]" : "w-auto max-w-[calc(100vw-2rem)]"}
            {...props}
          >
            {/* Left Status Badge for Perfect Symmetry */}
            <div className={`flex items-center justify-center h-7 w-7 rounded-xl flex-shrink-0 ${
              isDestructive
                ? "bg-red-500/15 border border-red-500/20 text-red-400"
                : "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
            }`}>
              {isDestructive ? (
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </div>

            <div className={`flex flex-col min-w-0 ${hasAction ? "flex-1 pr-1" : "pr-0.5"}`}>
              {title && <ToastTitle className="truncate">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="truncate text-zinc-400 text-xs mt-0.5">{description}</ToastDescription>
              )}
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
