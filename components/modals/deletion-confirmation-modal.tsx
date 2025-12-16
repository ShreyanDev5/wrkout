"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
        return `Are you sure you want to delete the "${itemName}" workout routine? This will permanently remove the routine, all associated days, and exercises. This action cannot be undone.`
      case 'day':
        return `Are you sure you want to delete the "${itemName}" day? This will permanently remove the day and all associated exercises. This action cannot be undone.`
      case 'exercise':
        return `Are you sure you want to delete the "${itemName}" exercise? This action cannot be undone.`
      default:
        return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92%] max-w-[320px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto flex flex-col items-center text-center p-4 shadow-lg backdrop-blur-xl">
        <DialogHeader className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-1.5 mb-1.5 w-full text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" aria-hidden="true" />
            <DialogTitle className="line-height-readable w-full text-center text-base font-semibold">
              {getHeading()}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 w-full flex flex-col items-center">
          <p className="line-height-readable w-full text-center text-sm text-muted-foreground px-0.5">
            {getMessage()}
          </p>
        </div>

        <div className="flex flex-row justify-between gap-2 mt-3.5 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
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
            className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
            aria-label={`Confirm ${itemType} deletion`}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}