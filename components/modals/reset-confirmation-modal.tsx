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
        heading = 'Delete Workout Routine';
        buttonLabel = 'Delete';
        cancelAria = 'Cancel delete';
        confirmAria = 'Confirm delete';
    }
    // Fallback to message matching if intent is generic 'reset'
    else if (message?.toLowerCase().includes('delete') && intent === 'reset') {
        heading = 'Delete Workout Routine';
        buttonLabel = 'Delete';
    } else if (message?.toLowerCase().includes('start a new workout') && intent === 'reset') {
        heading = 'Start New Workout';
        buttonLabel = 'Start';
    }

    if (message && intent === 'reset' && buttonLabel === 'Reset') {
        // Legacy generic fallback
        if (message.startsWith('Are you sure you want to delete')) {
            heading = 'Delete Workout Routine';
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
            return <LogOut className="h-5.5 w-5.5 text-red-500 animate-pulse" aria-hidden="true" />;
        }
        if (intent === 'start_new' || buttonLabel === 'Start') {
            return <Play className="h-5.5 w-5.5 text-emerald-500 fill-emerald-500/20 animate-pulse ml-0.5" aria-hidden="true" />;
        }
        if (buttonLabel === 'Delete') {
            return <AlertTriangle className="h-5.5 w-5.5 text-red-500 animate-pulse" aria-hidden="true" />;
        }
        return <RefreshCw className="h-5.5 w-5.5 text-amber-500 animate-pulse" aria-hidden="true" />;
    };

    const getConfirmButtonClasses = () => {
        if (buttonLabel === 'Sign Out' || buttonLabel === 'Delete' || buttonLabel === 'Reset') {
            return "bg-red-600 hover:bg-red-500 shadow-[0_4px_16px_rgba(220,38,38,0.2)]";
        }
        return "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.2)]";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                hideCloseButton
                className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
            >
                <DialogHeader className="w-full flex flex-col items-center">
                    {/* Floating Icon Box matching Onboarding */}
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
                        {getModalIcon()}
                    </div>
                    <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">
                        {heading}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2.5 w-full">
                    <p className="text-[11.5px] leading-relaxed text-zinc-400 text-center px-0.5">
                        {message || 'Are you sure you want to restart this session? All checked exercises will be marked as incomplete.'}
                    </p>
                </div>

                {/* Buttons Row with premium pill styles */}
                <div className="flex flex-row justify-between gap-2.5 mt-4 w-full px-0.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
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
                        className={`flex-1 h-11 rounded-full px-4 text-[13px] font-bold text-white transition-all active:scale-95 border-none ${getConfirmButtonClasses()}`}
                        aria-label={confirmAria}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

