"use client"

import { NotesSection } from "@/components/notes-section"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { WorkoutNote } from "@/lib/types"
import { motion } from "framer-motion"
import { StickyNote } from "lucide-react"

interface NotesScreenProps {
  notes: WorkoutNote[]
  onUpdateNotes: (notes: WorkoutNote[]) => void
}

export function NotesScreen({ notes, onUpdateNotes }: NotesScreenProps) {
  return (
    <Card className="border-0 shadow-none dark:bg-zinc-900 rounded-lg overflow-hidden">
      <CardHeader className="px-0 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FBBC04] shadow-md">
            <StickyNote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Notes</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">Capture your workout thoughts and ideas</p>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="px-0">
        <NotesSection notes={notes} onUpdateNotes={onUpdateNotes} />
      </CardContent>
    </Card>
  )
}
