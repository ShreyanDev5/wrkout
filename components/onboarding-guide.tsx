"use client"

import React, { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Flame } from "lucide-react"
import { LucideProps } from "lucide-react"
import {
  Dumbbell,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Calendar,
  Plus,
  Minus,
  Activity,
  Timer,
  Award,
  Lightbulb,
  Users,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: React.ComponentType<LucideProps>; // Made icon optional
  color: string;
  content: React.ReactNode;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to wrkout",
    subtitle: "Your minimalist strength companion",
    description: "Designed for progressive overload training with clean, distraction-free tracking based on the PPL (Push, Pull, Legs) split.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    content: (
      <div className="space-y-5 text-center pt-2">
        <div className="space-y-5">
          <motion.div 
            className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/10"
            initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1],
              type: "tween"
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent rounded-2xl"></div>
            <Sparkles className="h-8 w-8 text-white drop-shadow-md" />
            <motion.div 
              className="absolute inset-0 rounded-2xl bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 1
              }}
            />
          </motion.div>
          
          <div className="space-y-3">
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.15, 
                duration: 0.4, 
                ease: "easeOut",
                type: "tween"
              }}
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
              <span className="text-sm font-semibold text-foreground/80 tracking-normal">Progressive Overload</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.25, 
                duration: 0.4, 
                ease: "easeOut",
                type: "tween"
              }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm" />
              <span className="text-sm font-semibold text-foreground/80 tracking-normal">PPL Split</span>
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm" />
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.35, 
                duration: 0.4, 
                ease: "easeOut",
                type: "tween"
              }}
            >
              <div className="w-2 h-2 rounded-full bg-pink-400 shadow-sm" />
              <span className="text-sm font-semibold text-foreground/80 tracking-normal">Clean Interface</span>
              <div className="w-2 h-2 rounded-full bg-pink-400 shadow-sm" />
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="mx-auto max-w-[280px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.45, 
            duration: 0.4,
            type: "tween"
          }}
        >
          <p className="text-xs text-muted-foreground/90 leading-relaxed">
            Experience a premium workout tracking solution designed for serious lifters who value simplicity and effectiveness.
          </p>
        </motion.div>
      </div>
    )
  },
  {
    id: "ppl-philosophy",
    title: "Push • Pull • Legs",
    subtitle: "Your evolving training system",
    description: "Built on the proven PPL split with three organizational layers for flexible workout planning.",
    icon: Target,
    color: "from-blue-500 to-cyan-600",
    content: (
      <div className="space-y-3 pt-1">
        <motion.div 
          className="grid grid-cols-1 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            type: "tween"
          }}
        >
          {/* Workout Structure */}
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <Card className="border-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 shadow-md backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
              <CardContent className="p-3 relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <motion.div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "tween", 
                      duration: 0.15
                    }}
                  >
                    <Target className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm leading-tight text-foreground">Workout Routines</h4>
                    <p className="text-[10px] text-muted-foreground/80 truncate">High-level programs</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 shadow-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workout Days */}
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <Card className="border-0 bg-gradient-to-br from-purple-900/30 to-pink-900/20 shadow-md backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
              <CardContent className="p-3 relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <motion.div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "tween", 
                      duration: 0.15
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm leading-tight text-foreground">Workout Days</h4>
                    <p className="text-[10px] text-muted-foreground/80 truncate">Push, Pull, Legs</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-500 shadow-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exercises */}
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <Card className="border-0 bg-gradient-to-br from-amber-900/30 to-orange-900/20 shadow-md backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
              <CardContent className="p-3 relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <motion.div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "tween", 
                      duration: 0.15
                    }}
                  >
                    <Dumbbell className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm leading-tight text-foreground">Exercises</h4>
                    <p className="text-[10px] text-muted-foreground/80 truncate">Individual movements</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm" />
                  <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 shadow-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-cyan-900/10 backdrop-blur-sm border border-white/5"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.3,
            type: "tween"
          }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-foreground/80">Simple Tracking</span>
              <p className="text-[10px] text-muted-foreground/90 mt-1 leading-relaxed">
                Log weights and average reps for simplicity. Sets are consistent at 2-3 per exercise.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "progressive-overload",
    title: "Progressive Overload",
    subtitle: "The key to growth",
    description: "Gradually increase weight or reps to continuously challenge your muscles.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="space-y-4 mb-1">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "tween"
          }}
        >
          {/* Mobile-Optimized Progress visualization */}
          <div className="relative h-28 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 rounded-xl p-4 backdrop-blur-sm border border-white/5 shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl"></div>
            
            {/* Animated progress line */}
            <div className="relative h-full flex items-end justify-between">
              {[1, 2, 3, 4].map((week) => (
                <motion.div
                  key={week}
                  className="flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: week * 0.1, 
                    duration: 0.4, 
                    type: "tween"
                  }}
                >
                  <div 
                    className="w-5 rounded-t-md bg-gradient-to-t from-emerald-400 to-teal-400 shadow-sm"
                    style={{ height: `${20 + week * 8}px` }}
                  />
                  <motion.span 
                    className="text-[10px] font-semibold text-foreground/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: week * 0.1 + 0.15, 
                      duration: 0.3,
                      type: "tween"
                    }}
                  >
                    W{week}
                  </motion.span>
                </motion.div>
              ))}
            </div>
            
            {/* Simplified particles for mobile performance */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-emerald-400/15"
                initial={{ 
                  x: Math.random() * 80, 
                  y: Math.random() * 80,
                  opacity: 0
                }}
                animate={{ 
                  y: [null, -10, -20],
                  opacity: [0, 0.5, 0],
                  x: Math.random() * 80
                }}
                transition={{ 
                  duration: 1.5 + Math.random() * 1, 
                  repeat: Infinity,
                  delay: Math.random() * 1
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="space-y-2.5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.4,
            type: "tween"
          }}
        >
          <motion.div 
            className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-900/20 backdrop-blur-sm border border-white/5"
            whileHover={{ x: 2 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="p-1.5 rounded-md bg-emerald-500/20">
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-foreground/80">Add weight next session</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2.5 p-3 rounded-lg bg-teal-900/20 backdrop-blur-sm border border-white/5"
            whileHover={{ x: 2 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="p-1.5 rounded-md bg-teal-500/20">
              <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-xs font-medium text-foreground/80">Increase reps if weight stays same</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2.5 p-3 rounded-lg bg-cyan-900/20 backdrop-blur-sm border border-white/5"
            whileHover={{ x: 2 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="p-1.5 rounded-md bg-cyan-500/20">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <span className="text-xs font-medium text-foreground/80">Track progress with clean charts</span>
          </motion.div>
        </motion.div>
      </div>
    )
  },
  {
    id: "logging-workflow",
    title: "Smart Logging",
    subtitle: "Track what matters",
    description: "Log weights and average reps for simplicity. Sets are consistent at 2-3 per exercise.",
    icon: Zap,
    color: "from-orange-500 to-red-600",
    content: (
      <div className="space-y-4 mb-1">
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            type: "tween"
          }}
        >
          {/* Mobile-Optimized Workout completion flow */}
          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-900/20 to-red-900/10 backdrop-blur-sm border border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.03, rotate: 2 }}
                  transition={{ 
                    type: "tween", 
                    duration: 0.15
                  }}
                >
                  <Play className="h-4 w-4 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm leading-tight text-foreground">Complete Workout</h4>
                  <p className="text-[10px] text-muted-foreground/80 truncate">Mark exercises as done</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-900/20 to-emerald-900/10 backdrop-blur-sm border border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.03, rotate: 2 }}
                  transition={{ 
                    type: "tween", 
                    duration: 0.15
                  }}
                >
                  <CheckCircle className="h-4 w-4 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm leading-tight text-foreground">Log Performance</h4>
                  <p className="text-[10px] text-muted-foreground/80 truncate">Weight & average reps</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-900/20 to-cyan-900/10 backdrop-blur-sm border border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0 flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.03, rotate: 2 }}
                  transition={{ 
                    type: "tween", 
                    duration: 0.15
                  }}
                >
                  <BarChart3 className="h-4 w-4 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm leading-tight text-foreground">View Progress</h4>
                  <p className="text-[10px] text-muted-foreground/80 truncate">Charts & trends</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-gradient-to-r from-amber-900/20 to-orange-900/10 backdrop-blur-sm border border-white/5"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.3,
            type: "tween"
          }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-foreground/80">Smart Defaults</span>
              <p className="text-[10px] text-muted-foreground/90 mt-1 leading-relaxed">
                Previous weights and reps are pre-filled to speed up logging. Just adjust what changed.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "progress-visualization",
    title: "Progress Charts",
    subtitle: "See your growth",
    description: "Clean, touch-friendly charts showing your strength progression over time based on volume (weight × average reps).",
    icon: BarChart3,
    color: "from-purple-500 to-pink-600",
    content: (
      <div className="space-y-3 mb-1">
        <motion.div 
          className="relative h-28 bg-gradient-to-b from-background/30 to-background/10 rounded-xl flex flex-col justify-start overflow-visible shadow-md backdrop-blur-sm border border-white/5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            type: "tween"
          }}
        >
          {/* Mobile-Optimized chart background with subtle grid */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
            {/* Horizontal grid lines */}
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-border/20"
                style={{ top: `${25 + i * 25}%` }}
              />
            ))}
          </div>
          
          {/* Vertical bars for days with animation */}
          <div className="absolute inset-x-0 bottom-6 top-3 flex justify-between px-3 pointer-events-none select-none z-0">
            {[0,1,2,3,4,5,6].map(i => (
              <motion.div
                key={i}
                className="h-full w-2 rounded-t-sm"
                style={{
                  background:
                    i === 4
                      ? 'rgba(180,180,220,0.15)' // Highlight Friday
                      : 'rgba(180,180,220,0.08)'
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ 
                  delay: i * 0.06, 
                  duration: 0.3, 
                  type: "tween"
                }}
                transformOrigin="bottom"
              />
            ))}
          </div>
          
          {/* Enhanced gradient line chart */}
          <svg className="relative z-10 w-full h-28" viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="0.5" stopColor="#06b6d4" />
                <stop offset="0.85" stopColor="#ec4899" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M0,45 C25,15 50,60 75,30 S135,10 180,20"
              stroke="url(#chart-gradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                type: "tween"
              }}
            />
            {/* Data points */}
            {[0, 30, 60, 90, 120, 150, 180].map((x, i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={45 - 8 * Math.sin(i * 0.8)}
                r="2"
                fill="#8b5cf6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.5 + i * 0.06, 
                  duration: 0.2,
                  type: "tween"
                }}
              />
            ))}
          </svg>
          
          {/* Enhanced weekday labels */}
          <div className="absolute left-0 right-0 bottom-1 h-4 pointer-events-none select-none" style={{ width: '100%' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const lefts = [12, 52, 92, 132, 172, 212, 252];
              return (
                <motion.span
                  key={i}
                  className={
                    (i === 4 ? "text-foreground font-semibold " : "") + "absolute text-[9px] text-muted-foreground/80 font-medium tracking-wide"
                  }
                  style={{
                    left: `${lefts[i]}px`,
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.7 + i * 0.03, 
                    duration: 0.25,
                    type: "tween"
                  }}
                >
                  {d}
                </motion.span>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-3 gap-2 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.4,
            type: "tween"
          }}
        >
          <motion.div 
            className="p-2.5 rounded-lg bg-gradient-to-br from-purple-900/20 to-purple-900/10 backdrop-blur-sm border border-white/5"
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded-md bg-purple-500/20">
                <TrendingUp className="h-3 w-3 text-purple-400" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/80">WEIGHT</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-300">+5.2</span>
              <span className="text-[9px] text-emerald-400 font-semibold">kg</span>
            </div>
            <p className="text-[9px] text-muted-foreground/80 mt-1">This month</p>
          </motion.div>
          
          <motion.div 
            className="p-2.5 rounded-lg bg-gradient-to-br from-pink-900/20 to-pink-900/10 backdrop-blur-sm border border-white/5"
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded-md bg-pink-500/20">
                <Activity className="h-3 w-3 text-pink-400" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/80">REPS</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-300">+12</span>
              <span className="text-[9px] text-emerald-400 font-semibold">total</span>
            </div>
            <p className="text-[9px] text-muted-foreground/80 mt-1">Last 7 days</p>
          </motion.div>
          
          <motion.div 
            className="p-2.5 rounded-lg bg-gradient-to-br from-blue-900/20 to-blue-900/10 backdrop-blur-sm border border-white/5"
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ 
              type: "tween", 
              duration: 0.15
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded-md bg-blue-500/20">
                <Award className="h-3 w-3 text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/80">PRs</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">3</span>
              <span className="text-[9px] text-emerald-400 font-semibold">new</span>
            </div>
            <p className="text-[9px] text-muted-foreground/80 mt-1">This week</p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/10 backdrop-blur-sm border border-white/5"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.35, 
            duration: 0.35,
            type: "tween"
          }}
        >
          <div className="flex items-start gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-foreground/80">Volume Calculation</span>
              <p className="text-[10px] text-muted-foreground/90 mt-1 leading-relaxed">
                Progress is calculated using volume (weight × average reps) for accurate strength tracking.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "get-started",
    title: "You're All Set!",
    subtitle: "Ready to crush your fitness goals?",
    description: "Your fitness journey starts now. Track, improve, and celebrate your progress with every rep.",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="space-y-5 text-center pt-1">
        <motion.div 
          className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/10"
          initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            type: "tween"
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent rounded-full"></div>
          <CheckCircle className="h-8 w-8 text-white drop-shadow-md" />
          {/* Simplified celebration particles for mobile with reduced count */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              initial={{ 
                x: 0, 
                y: 0,
                opacity: 1
              }}
              animate={{ 
                x: Math.cos(i * 90 * Math.PI / 180) * 25,
                y: Math.sin(i * 90 * Math.PI / 180) * 25,
                opacity: 0
              }}
              transition={{ 
                duration: 1, 
                delay: 0.3,
                ease: "easeOut",
                type: "tween"
              }}
            />
          ))}
        </motion.div>
        
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2, 
              duration: 0.4,
              type: "tween"
            }}
          >
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Start Tracking Your Workouts
            </h3>
            <p className="text-xs text-muted-foreground/90 mt-1.5">
              Progress is saved and synced across devices.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-3 mt-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.35, 
              duration: 0.4,
              type: "tween"
            }}
          >
            <motion.div 
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 backdrop-blur-sm border border-white/5 text-center shadow-sm"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ 
                type: "tween", 
                duration: 0.15
              }}
            >
              <div className="p-1.5 rounded-md bg-emerald-500/20 w-8 h-8 mx-auto flex items-center justify-center">
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm mt-1.5 text-foreground">Quick Start</h4>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Begin first workout</p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-sm border border-white/5 text-center shadow-sm"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ 
                type: "tween", 
                duration: 0.15
              }}
            >
              <div className="p-1.5 rounded-md bg-amber-500/20 w-8 h-8 mx-auto flex items-center justify-center">
                <Settings className="h-4 w-4 text-amber-400" />
              </div>
              <h4 className="font-bold text-sm mt-1.5 text-foreground">Customize</h4>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Set preferences</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  },
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    // Mark onboarding as completed in localStorage
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true')
    }
    onClose()
  }, [user?.id, onClose])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0

  const renderIcon = useCallback(() => {
    const Icon = currentStepData.icon || Sparkles;
    return <Icon className="h-4.5 w-4.5 text-white" />;
  }, [currentStepData.icon])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[calc(100%-1.5rem)] max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl border-0 bg-background/80 backdrop-blur-2xl border-border/30 artistic-dialog mobile-narrow-modal"
        hideCloseButton={true}
      >
        <DialogTitle className="sr-only">Onboarding Guide</DialogTitle>
        {/* Premium Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted/10 overflow-hidden rounded-t-3xl">
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-r-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ 
              duration: 0.6, 
              ease: [0.16, 1, 0.3, 1],
              type: "tween"
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            {/* Animated shine effect with reduced frequency for performance */}
            <motion.div
              className="absolute top-0 bottom-0 w-8 bg-white/20 blur-[1px]"
              initial={{ x: -100 }}
              animate={{ x: "100vw" }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
            />
          </motion.div>
        </div>

        {/* Mobile-Optimized Header */}
        <div className="p-4 pb-3 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <motion.div 
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10`}
                key={currentStep}
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1],
                  type: "tween"
                }}
              >
                {React.cloneElement(renderIcon(), { className: 'h-4 w-4 text-white drop-shadow-md' })}
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-muted-foreground/80 tracking-wide">
                  STEP {currentStep + 1} OF {onboardingSteps.length}
                </span>
                <span className="text-[10px] font-semibold text-foreground/60 tracking-wider mt-0.5 truncate max-w-[120px]">
                  {currentStepData.title.toUpperCase()}
                </span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground px-2.5 py-1 h-7 rounded-lg transition-all duration-200 hover:bg-white/5 backdrop-blur-sm border border-white/5 text-xs font-semibold min-w-[60px] flex items-center justify-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              Skip
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.16, 1, 0.3, 1],
                type: "tween"
              }}
            >
              <h2 className="text-xl font-bold mb-1.5 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                {currentStepData.title}
              </h2>
              <p className="text-sm font-semibold text-foreground/70 mb-1.5 tracking-normal">
                {currentStepData.subtitle}
              </p>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                {currentStepData.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile-Optimized Content */}
        <div className="px-4 pb-5">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-background/50 to-background/20 border border-border/20 backdrop-blur-sm mb-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: [0.16, 1, 0.3, 1],
                    type: "tween"
                  }}
                  className="min-h-[220px] flex items-center justify-center p-3"
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile-Optimized Navigation */}
          <div className="flex items-center justify-between space-x-3">
            <motion.button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex-1 h-11 text-sm font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border/30 bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              whileHover={!isFirstStep ? { scale: 1.02 } : {}}
              whileTap={!isFirstStep ? { scale: 0.98 } : {}}
              transition={{ type: "tween", duration: 0.15 }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleNext}
              className="flex-1 h-11 text-sm font-semibold bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 hover:from-violet-600 hover:via-blue-600 hover:to-emerald-600 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-lg hover:shadow-xl rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center min-w-[100px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              {isLastStep ? (
                <span className="flex items-center gap-2">
                  Get Started
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 