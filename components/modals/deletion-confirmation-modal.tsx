"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeletionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemType: string
  itemName: string
}

export function DeletionConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemType,
  itemName
}: DeletionConfirmationModalProps) {
  const getHeading = () => {
    switch (itemType) {
      case 'workout':
        return 'Delete Workout Routine'
      case 'day':
        return 'Delete Workout Day'
      case 'exercise':
        return 'Delete Exercise'
      default:
        return 'Delete Item'
    }
  }

  const getMessage = () => {
    switch (itemType) {
      case 'workout':
        return (
          <>
            Are you sure you want to permanently delete the <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span> workout routine? All associated sessions and exercises will be removed. This action cannot be undone.
          </>
        )
      case 'day':
        return (
          <>
            Are you sure you want to permanently delete the <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span> day? All associated exercises will be removed. This action cannot be undone.
          </>
        )
      case 'exercise':
        return (
          <>
            Are you sure you want to permanently delete the <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span> exercise? This action cannot be undone.
          </>
        )
      default:
        return (
          <>
            Are you sure you want to permanently delete <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span>? This action cannot be undone.
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton
        className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
      >
        <DialogHeader className="w-full flex flex-col items-center">
          {/* Floating Icon Box matching Onboarding */}
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
            <AlertTriangle className="h-5.5 w-5.5 text-amber-500 animate-pulse" aria-hidden="true" />
          </div>
          <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">
            {getHeading()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2.5 w-full">
          <p className="text-[11.5px] leading-relaxed text-zinc-400 text-center px-0.5">
            {getMessage()}
          </p>
        </div>

        {/* Buttons Row with premium pill styles */}
        <div className="flex flex-row justify-between gap-2.5 mt-4 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9.5 rounded-full border border-white/8 bg-white/[0.02] px-3.5 py-1.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 h-9.5 rounded-full bg-red-600 hover:bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(220,38,38,0.2)] border-none"
            aria-label={`Confirm ${itemType} deletion`}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}