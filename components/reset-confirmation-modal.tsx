"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ResetConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  dayColor: string
  message?: string
}

export function ResetConfirmationModal({ isOpen, onClose, onConfirm, dayColor, message }: ResetConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm dark:bg-background dark:border-opacity-10 rounded-lg mx-auto">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <DialogTitle className="line-height-readable text-center">{message ? 'Sign Out' : 'Reset Workout Session'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="line-height-readable text-center">
            {message || 'Are you sure you want to restart this session? All checked exercises will be marked as incomplete.'}
          </p>
        </div>

        {/* Button Row: Use plain div for full control */}
        <div className="flex flex-row justify-between gap-2 mt-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary"
            aria-label={message ? 'Cancel sign out' : 'Cancel reset'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none"
            aria-label={message ? 'Confirm sign out' : 'Confirm reset'}
          >
            {message ? 'Sign Out' : 'Reset'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
