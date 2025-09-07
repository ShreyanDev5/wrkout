"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface RestrictionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function RestrictionConfirmationModal({ isOpen, onClose, title, message }: RestrictionConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto flex flex-col items-center text-center p-4 shadow-lg backdrop-blur-xl">
        <DialogHeader className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-1.5 mb-1.5 w-full text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" aria-hidden="true" />
            <DialogTitle className="line-height-readable w-full text-center text-base font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 w-full flex flex-col items-center">
          <p className="line-height-readable w-full text-center text-sm md:text-base text-muted-foreground px-0.5">
            {message}
          </p>
        </div>

        <div className="flex flex-row justify-between gap-2 mt-3.5 w-full px-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
            aria-label="Close"
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}