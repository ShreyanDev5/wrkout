"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"

import { useHaptics } from "@/hooks/use-haptics"
import { Flame } from "lucide-react"

interface CompletionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CompletionModal({ isOpen, onClose }: CompletionModalProps) {
    // Prevent hydration mismatch by ensuring dialog only renders on client
    const [isMounted, setIsMounted] = useState(false)
    const { trigger: haptic } = useHaptics()

    useEffect(() => {
        setIsMounted(true)
        if (isOpen) {
            // Delay increased to 300ms to allow the DOM to render the new Dialog,
            // prevent overlap with the 'Done' button haptic from the inline logger,
            // and sync perfectly with the peak of the visual pop animation.
            const timer = setTimeout(() => haptic("success"), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen, haptic])

    if (!isMounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center relative"
                hideCloseButton={true}
            >
                <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
                    <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 shadow-sm text-amber-500">
                        <Flame className="h-5 w-5 fill-amber-500/20 text-amber-500" strokeWidth={2} />
                    </div>

                    <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
                        Session Complete
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1.5 leading-relaxed">
                        Great work today.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 w-full">
                    <button
                        type="button"
                        onClick={() => {
                            haptic("light")
                            onClose()
                        }}
                        className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-xs font-semibold text-zinc-950 transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer flex items-center justify-center"
                    >
                        Done
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

