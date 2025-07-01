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
      <DialogContent className="w-[90%] max-w-[425px] dark:bg-background dark:border-opacity-10 rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <DialogTitle className="line-height-readable">{message ? 'Sign Out' : 'Reset Workout Session'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="line-height-readable">
            {message || 'Are you sure you want to restart this session? All checked exercises will be marked as incomplete.'}
          </p>
        </div>

        <DialogFooter className="flex flex-row justify-center gap-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[140px] min-touch-target focus-visible-ring dark:border-opacity-10 dark:hover:bg-secondary font-semibold"
            aria-label={message ? 'Cancel sign out' : 'Cancel reset'}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="min-w-[140px] min-touch-target focus-visible-ring dark:border-none dark:shadow-none font-semibold"
            aria-label={message ? 'Confirm sign out' : 'Confirm reset'}
          >
            {message ? 'Sign Out' : 'Reset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
