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
        return 'Delete Routine'
      case 'day':
        return 'Delete Day'
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
            Are you sure you want to delete <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span>? All associated days and exercises will be removed.
          </>
        )
      case 'day':
        return (
          <>
            Are you sure you want to delete <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span>? Its exercises will be removed.
          </>
        )
      case 'exercise':
        return (
          <>
            Are you sure you want to delete <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span>?
          </>
        )
      default:
        return (
          <>
            Are you sure you want to delete <span className="font-extrabold text-zinc-100">&quot;{itemName}&quot;</span>?
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton
        className="w-[88%] max-w-[280px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 outline-none select-none mx-auto flex flex-col items-center relative"
      >
        <DialogHeader className="w-full flex flex-col items-center">
          {/* Ambient Red Icon Box */}
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500" strokeWidth={2} aria-hidden="true" />
          </div>
          <DialogTitle className="text-base font-extrabold tracking-tight text-white text-center w-full leading-snug">
            {getHeading()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 w-full">
          <p className="text-xs leading-relaxed text-zinc-400 text-center px-0.5">
            {getMessage()}
          </p>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-row justify-between gap-2.5 mt-2.5 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95 shadow-none"
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
            className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 px-3 text-xs font-bold text-white transition-all active:scale-95 shadow-sm border-none"
            aria-label={`Confirm ${itemType} deletion`}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}