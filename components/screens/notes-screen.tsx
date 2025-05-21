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
    <Card className="border-0 shadow-none dark:bg-background">
      <CardHeader className="px-0 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FBBC04] shadow-sm">
            <StickyNote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Capture your workout thoughts and ideas</p>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="px-0">
        <NotesSection notes={notes} onUpdateNotes={onUpdateNotes} />
      </CardContent>
    </Card>
  )
}
