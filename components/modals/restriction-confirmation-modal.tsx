"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface RestrictionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function RestrictionConfirmationModal({ isOpen, onClose, title, message }: RestrictionConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton
        className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
      >
        <DialogHeader className="w-full flex flex-col items-center">
          {/* Floating Icon Box matching Onboarding */}
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
            <AlertCircle className="h-5.5 w-5.5 text-amber-500 animate-pulse" aria-hidden="true" />
          </div>
          <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2.5 w-full">
          <p className="text-[11.5px] leading-relaxed text-zinc-400 text-center px-0.5">
            {message}
          </p>
        </div>

        {/* Buttons Row with premium pill style */}
        <div className="flex flex-row justify-center mt-4 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
            aria-label="Close"
          >
            Got It
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}