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
  intent?: 'reset' | 'start_new' | 'sign_out' | 'delete'
}

export function ResetConfirmationModal({ isOpen, onClose, onConfirm, dayColor, message, intent = 'reset' }: ResetConfirmationModalProps) {
  // Determine heading and button label based on intent
  let heading = 'Reset Workout Session';
  let buttonLabel = 'Reset';
  let cancelAria = 'Cancel reset';
  let confirmAria = 'Confirm reset';

  if (intent === 'start_new') {
    heading = 'Start New Workout';
    buttonLabel = 'Start';
    cancelAria = 'Cancel start workout';
    confirmAria = 'Confirm start new workout';
  } else if (intent === 'sign_out') {
    heading = 'Sign Out';
    buttonLabel = 'Sign Out';
    cancelAria = 'Cancel sign out';
    confirmAria = 'Confirm sign out';
  } else if (intent === 'delete') {
    heading = 'Delete Workout Routine';
    buttonLabel = 'Delete';
    cancelAria = 'Cancel delete';
    confirmAria = 'Confirm delete';
  }
  // Fallback to message matching if intent is generic 'reset'
  else if (message?.toLowerCase().includes('delete') && intent === 'reset') {
    heading = 'Delete Workout Routine';
    buttonLabel = 'Delete';
  } else if (message?.toLowerCase().includes('start a new workout') && intent === 'reset') {
    heading = 'Start New Workout';
    buttonLabel = 'Start';
  }

  if (message && intent === 'reset' && buttonLabel === 'Reset') {
    // Legacy generic fallback
    if (message.startsWith('Are you sure you want to delete')) {
      heading = 'Delete Workout Routine';
      buttonLabel = 'Delete';
    } else if (message.includes('start a new workout')) {
      heading = 'Start New Workout';
      buttonLabel = 'Start';
    } else if (!message.includes('reset')) {
      // if it doesn't say "reset", it might be sign out
      heading = 'Sign Out';
      buttonLabel = 'Sign Out';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto flex flex-col items-center text-center p-4 shadow-lg backdrop-blur-xl">
        <DialogHeader className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-1.5 mb-1.5 w-full text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" aria-hidden="true" />
            <DialogTitle className="line-height-readable w-full text-center text-base font-semibold">{heading}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 w-full flex flex-col items-center">
          <p className="line-height-readable w-full text-center text-sm md:text-base text-muted-foreground px-0.5">
            {message || 'Are you sure you want to restart this session? All checked exercises will be marked as incomplete.'}
          </p>
        </div>

        {/* Button Row: Use plain div for full control */}
        <div className="flex flex-row justify-between gap-2 mt-3.5 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
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
            className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
            aria-label={confirmAria}
          >
            {buttonLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
