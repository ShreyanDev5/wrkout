"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
                <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                    <LogOut className="h-5 w-5 text-red-500" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        if (intent === 'start_new' || buttonLabel === 'Start') {
            return (
                <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-leg-dark/25 bg-leg-dark/10 shadow-sm">
                    <Play className="h-5 w-5 text-leg-dark fill-leg-dark/20 ml-0.5" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        if (buttonLabel === 'Delete') {
            return (
                <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={2} aria-hidden="true" />
                </div>
            )
        }
        return (
            <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 shadow-sm">
                <RefreshCw className="h-5 w-5 text-red-500" strokeWidth={2} aria-hidden="true" />
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
                centerMobile={true}
                className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center relative"
            >
                <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
                    {getModalIcon()}
                    <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
                        {heading}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1.5 leading-relaxed px-1">
                        {message || 'Are you sure you want to restart this session? Completed exercises will be reset.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Buttons Row */}
                <div className="flex flex-row justify-between gap-2.5 mt-6 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-[0.98] shadow-none cursor-pointer"
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
                        className={`flex-1 h-10 rounded-xl font-semibold px-3 text-xs transition-all active:scale-[0.98] border-none shadow-sm cursor-pointer ${getConfirmButtonClasses()}`}
                        aria-label={confirmAria}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

