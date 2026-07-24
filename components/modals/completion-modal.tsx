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
                className="w-[92%] max-w-[315px] overflow-hidden rounded-[24px] border border-amber-500/25 bg-zinc-950 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center text-center relative"
                hideCloseButton={true}
            >
                {/* Full-Modal Seamless Golden-Amber Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-amber-950/25 to-zinc-950 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/16 via-amber-500/8 to-transparent pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 w-full">
                    {/* Fiery Icon Badge with Soft Amber Tint */}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 shadow-sm text-3xl">
                        🔥
                    </div>

                    <div className="space-y-1">
                        <DialogTitle className="text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
                            Session Complete
                        </DialogTitle>
                        <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest drop-shadow-sm">
                            Show up. Execute. Repeat.
                        </p>
                    </div>

                    {/* Compact Solid Deep Yellow Action Button */}
                    <div className="w-full flex justify-center pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                haptic("light")
                                onClose()
                            }}
                            className="w-[124px] h-[38px] rounded-xl bg-amber-500 hover:bg-amber-400 text-[13.5px] font-extrabold text-zinc-950 transition-all active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none cursor-pointer flex items-center justify-center"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

