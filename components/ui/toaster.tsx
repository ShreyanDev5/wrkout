"use client"

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
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"
        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Left Status Badge for Perfect Symmetry */}
            <div className={`flex items-center justify-center h-6 w-6 rounded-lg flex-shrink-0 ${
              isDestructive
                ? "bg-red-500/15 border border-red-500/25 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            }`}>
              {isDestructive ? (
                <Trash2 className="h-3 w-3" strokeWidth={2.2} />
              ) : (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1 py-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
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
