"use client"

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Check } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"

interface OnboardingScreenProps {
    onComplete: () => void
}

const steps = [
    {
        title: "Focus on Today",
        description: "Forget the history. Forget the charts. Your only goal is to complete the workout in front of you.",
        bgGradient: "from-blue-500/10 to-purple-500/10",
        accentColor: "#60A5FA"
    },
    {
        title: "Smart Defaults",
        description: "We remember your last weights. You just log the improvements. Less typing, more lifting.",
        bgGradient: "from-green-500/10 to-emerald-500/10",
        accentColor: "#34D399"
    },
    {
        title: "Inline & Fast",
        description: "Tap any exercise to log it. No modals, no context switching. Just flow.",
        bgGradient: "from-orange-500/10 to-red-500/10",
        accentColor: "#F87171"
    }
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi, onSelect])

    const { trigger: haptic } = useHaptics()

    const scrollNext = () => {
        haptic("light")
        if (emblaApi) emblaApi.scrollNext()
    }

    const handleComplete = () => {
        haptic("success")
        onComplete()
    }

    const isLastSlide = selectedIndex === steps.length - 1

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-4">
            <div className="w-full relative overflow-hidden rounded-3xl bg-secondary/5 border border-white/5 shadow-2xl backdrop-blur-sm aspect-[4/5] max-h-[500px]">

                {/* Carousel */}
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full touch-pan-y">
                        {steps.map((step, index) => (
                            <div className="flex-[0_0_100%] min-w-0 relative h-full p-8 flex flex-col justify-center items-center text-center" key={index}>
                                {/* Background Blob */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} opacity-30 blur-3xl`}
                                    style={{ zIndex: -1 }}
                                />

                                <h2 className="text-3xl font-bold mb-4 tracking-tight" style={{ color: step.accentColor }}>
                                    {step.title}
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                            onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        />
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-6 left-0 right-0 px-6">
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-white"
                        style={{
                            backgroundColor: steps[selectedIndex].accentColor
                        }}
                        onClick={isLastSlide ? handleComplete : scrollNext}
                    >
                        {isLastSlide ? (
                            <span className="flex items-center gap-2">Get Started <Check className="h-4 w-4" /></span>
                        ) : (
                            <span className="flex items-center gap-2">Next <ChevronRight className="h-4 w-4" /></span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
