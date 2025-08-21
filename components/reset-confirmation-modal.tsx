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
  // Determine heading and button label based on message
  let heading = 'Reset Workout Session';
  let buttonLabel = 'Reset';
  let cancelAria = 'Cancel reset';
  let confirmAria = 'Confirm reset';

  if (message) {
    if (message.startsWith('Are you sure you want to delete your last workout routine?')) {
      heading = 'Delete Workout Routine';
      buttonLabel = 'Delete';
      cancelAria = 'Cancel delete';
      confirmAria = 'Confirm delete';
    } else if (message.toLowerCase().includes('reset all completed exercises')) {
      heading = 'Reset Workout Progress';
      buttonLabel = 'Reset';
      cancelAria = 'Cancel reset';
      confirmAria = 'Confirm reset';
    } else {
      heading = 'Sign Out';
      buttonLabel = 'Sign Out';
      cancelAria = 'Cancel sign out';
      confirmAria = 'Confirm sign out';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-md dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto flex flex-col items-center text-center p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-2 w-full text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" aria-hidden="true" />
            <DialogTitle className="line-height-readable w-full text-center text-lg sm:text-xl font-semibold">{heading}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-3 w-full flex flex-col items-center">
          <p className="line-height-readable w-full text-center text-sm sm:text-base text-muted-foreground px-2">
            {message || 'Are you sure you want to restart this session? All checked exercises will be marked as incomplete.'}
          </p>
        </div>

        {/* Button Row: Use plain div for full control */}
        <div className="flex flex-row justify-between gap-3 mt-4 w-full px-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm sm:text-base"
            aria-label={cancelAria}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 px-4 py-2.5 rounded-lg border font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm sm:text-base"
            aria-label={confirmAria}
          >
            {buttonLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
