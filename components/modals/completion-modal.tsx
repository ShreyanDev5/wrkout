"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"

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
                className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-0 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col"
                hideCloseButton={true}
            >
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 relative">

                    {/* Subtle Glow Background Effect - Fiery & Energetic */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-amber-500/10 opacity-40 mix-blend-plus-lighter pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/20 rounded-full blur-3xl opacity-30 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="text-5xl animate-in zoom-in-50 duration-500 ease-out-back">
                            🔥
                        </div>

                        <div className="space-y-1.5 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-150 fill-mode-both">
                            <DialogTitle className="text-[1.2rem] font-extrabold tracking-tight text-white">
                                Session Complete
                            </DialogTitle>
                            <p className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest">
                                Show up. Execute. Repeat.
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="relative z-10 w-full pt-1 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-300 fill-mode-both">
                        <button
                            type="button"
                            onClick={() => {
                                haptic("light")
                                onClose()
                            }}
                            className="w-full h-9.5 rounded-full bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(234,88,12,0.2)] border-none"
                        >
                            Done
                        </button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

