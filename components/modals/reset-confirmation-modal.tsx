"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, LogOut, RefreshCw, Play } from "lucide-react"

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
        heading = 'Delete Routine';
        buttonLabel = 'Delete';
        cancelAria = 'Cancel delete';
        confirmAria = 'Confirm delete';
    }
    // Fallback to message matching if intent is generic 'reset'
    else if (message?.toLowerCase().includes('delete') && intent === 'reset') {
        heading = 'Delete Routine';
        buttonLabel = 'Delete';
    } else if (message?.toLowerCase().includes('start a new workout') && intent === 'reset') {
        heading = 'Start New Workout';
        buttonLabel = 'Start';
    }

    if (message && intent === 'reset' && buttonLabel === 'Reset') {
        // Legacy generic fallback
        if (message.startsWith('Are you sure you want to delete')) {
            heading = 'Delete Routine';
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

    // Determine the icon and color based on intent/button label
    const getModalIcon = () => {
        if (intent === 'sign_out' || buttonLabel === 'Sign Out') {
            return (
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                    <LogOut className="h-4.5 w-4.5 text-red-500" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        if (intent === 'start_new' || buttonLabel === 'Start') {
            return (
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-leg-dark/25 bg-leg-dark/10 shadow-sm">
                    <Play className="h-4.5 w-4.5 text-leg-dark fill-leg-dark/20 ml-0.5" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        if (buttonLabel === 'Delete') {
            return (
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-500" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        return (
            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                <RefreshCw className="h-4.5 w-4.5 text-red-500" strokeWidth={2} aria-hidden="true" />
            </div>
        )
    }

    const getConfirmButtonClasses = () => {
        if (buttonLabel === 'Sign Out' || buttonLabel === 'Delete' || buttonLabel === 'Reset') {
            return "bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-sm text-white";
        }
        return "bg-leg-dark hover:opacity-90 shadow-sm text-white";
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                hideCloseButton
                className="w-[88%] max-w-[280px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 outline-none select-none mx-auto flex flex-col items-center relative"
            >
                <DialogHeader className="w-full flex flex-col items-center">
                    {getModalIcon()}
                    <DialogTitle className="text-base font-extrabold tracking-tight text-white text-center w-full leading-snug">
                        {heading}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2 w-full">
                    <p className="text-xs leading-relaxed text-zinc-400 text-center px-0.5">
                        {message || 'Are you sure you want to restart this session? Completed exercises will be reset.'}
                    </p>
                </div>

                {/* Buttons Row */}
                <div className="flex flex-row justify-between gap-2.5 mt-2.5 w-full px-0.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95 shadow-none"
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
                        className={`flex-1 h-9 rounded-xl px-3 text-xs font-bold transition-all active:scale-95 border-none ${getConfirmButtonClasses()}`}
                        aria-label={confirmAria}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

