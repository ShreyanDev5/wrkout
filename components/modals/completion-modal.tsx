"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

import { useHaptics } from "@/hooks/use-haptics"

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
                className="w-[90%] max-w-[320px] rounded-3xl border-0 bg-background/80 backdrop-blur-xl shadow-2xl p-0 overflow-hidden"
                hideCloseButton={true}
            >
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">

                    {/* Subtle Glow Background Effect - Fiery & Energetic */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-amber-500/20 opacity-60 mix-blend-plus-lighter" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/30 rounded-full blur-3xl opacity-40" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/30 rounded-full blur-3xl opacity-40" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="text-6xl animate-in zoom-in-50 duration-500 ease-out-back">
                            🔥
                        </div>

                        <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-150 fill-mode-both">
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Session Complete
                            </DialogTitle>
                            <p className="text-sm font-bold text-orange-600/90 dark:text-orange-400/90 uppercase tracking-widest text-[0.7rem] shadow-sm">
                                Show up. Execute. Repeat.
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="relative z-10 w-full pt-2 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-300 fill-mode-both">
                        <Button
                            onClick={() => {
                                haptic("light")
                                onClose()
                            }}
                            className={cn(
                                "w-full rounded-2xl h-12 text-base font-semibold",
                                "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
                                "dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
                                "transition-all duration-300 shadow-lg shadow-zinc-500/10"
                            )}
                        >
                            Done
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
