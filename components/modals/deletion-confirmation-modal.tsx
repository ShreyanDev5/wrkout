"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
        className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center relative"
      >
        <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
          {/* Ambient Red Icon Box */}
          <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={2} aria-hidden="true" />
          </div>
          <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
            {getHeading()}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1.5 leading-relaxed px-1">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        {/* Buttons Row */}
        <div className="flex flex-row justify-between gap-2.5 mt-6 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-[0.98] shadow-none cursor-pointer"
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
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 px-3 text-xs font-semibold text-white transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer"
            aria-label={`Confirm ${itemType} deletion`}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}