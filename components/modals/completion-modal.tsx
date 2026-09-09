"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
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
                className="w-[85%] max-w-[260px] sm:max-w-[260px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center text-center relative"
                hideCloseButton={true}
            >
                <div className="flex flex-col items-center justify-center text-center space-y-3.5 w-full">
                    {/* Clean Crisp Flame Icon (No Boxes, No Glows) */}
                    <div className="flex items-center justify-center pt-0.5">
                        <Flame className="h-8 w-8 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-1">
                        <DialogTitle className="text-base font-extrabold tracking-tight text-white">
                            Session Complete
                        </DialogTitle>
                        <p className="text-xs font-medium text-zinc-400">
                            Great work today.
                        </p>
                    </div>

                    {/* Full-width Action Button */}
                    <div className="w-full pt-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                haptic("light")
                                onClose()
                            }}
                            className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-xs font-bold text-zinc-950 transition-all active:scale-[0.98] shadow-none border-none cursor-pointer flex items-center justify-center"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

