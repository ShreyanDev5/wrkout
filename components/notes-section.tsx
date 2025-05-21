"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Bold, Italic, Link, List, Clock, Sparkles, Tag, Palette, Save, X } from "lucide-react"
import type { WorkoutNote } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Define note color options using Google's matte palette
const NOTE_COLORS = [
  { name: "default", value: "bg-zinc-800", textColor: "text-zinc-100" },
  { name: "yellow", value: "bg-[#FBBC04]", textColor: "text-zinc-900" },
  { name: "green", value: "bg-[#34A853]", textColor: "text-white" },
  { name: "red", value: "bg-[#EA4335]", textColor: "text-white" },
]

interface NotesSectionProps {
  notes: WorkoutNote[]
  onUpdateNotes: (notes: WorkoutNote[]) => void
}

export function NotesSection({ notes, onUpdateNotes }: NotesSectionProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [filteredNotes, setFilteredNotes] = useState<WorkoutNote[]>(notes)
  const [selectedColor, setSelectedColor] = useState("default")
  const { colorMode } = useTheme()
  const { toast } = useToast()
  const [editorMounted, setEditorMounted] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useIsMobile()

  // Ensure editor is only mounted client-side
  useEffect(() => {
    setEditorMounted(true)
  }, [])

  // Update filtered notes when notes change
  useEffect(() => {
    setFilteredNotes(notes)
  }, [notes])

  // Set up editor when editing a note
  useEffect(() => {
    if (editingNoteId && editorMounted) {
      const editingNote = notes.find((note) => note.id === editingNoteId)
      if (editingNote) {
        setEditContent(editingNote.content)
        setSelectedColor(editingNote.color || "default")
      }
    }
  }, [editingNoteId, notes, editorMounted])

  // Focus editor when opened
  useEffect(() => {
    if (editingNoteId && editorRef.current) {
      editorRef.current.focus()
    }
  }, [editingNoteId])

  const handleAddNote = () => {
    const newNote: WorkoutNote = {
      id: `note-${Date.now()}`,
      content: "<p>New note</p>",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: "default",
      category: "general",
    }

    onUpdateNotes([newNote, ...notes])
    setEditingNoteId(newNote.id)
    setEditContent(newNote.content)
    setSelectedColor("default")

    toast({
      title: "Note created",
      description: "Your new note has been created.",
      className: "bg-[#34A853] border-none text-white",
    })
  }

  const handleEditNote = (note: WorkoutNote) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
    setSelectedColor(note.color || "default")
  }

  const handleSaveNote = () => {
    if (!editingNoteId) return

    const updatedNotes = notes.map((note) =>
      note.id === editingNoteId
        ? {
            ...note,
            content: editContent.trim() || "<p>Empty note</p>",
            updatedAt: new Date().toISOString(),
            color: selectedColor,
          }
        : note,
    )

    onUpdateNotes(updatedNotes)
    setEditingNoteId(null)

    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
      className: "bg-[#34A853] border-none text-white",
    })
  }

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    onUpdateNotes(updatedNotes)

    if (editingNoteId === noteId) {
      setEditingNoteId(null)
    }

    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
      className: "bg-[#EA4335] border-none text-white",
    })
  }

  const handleFormatText = (format: string) => {
    if (!editingNoteId || !editorMounted || !editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `<strong>${selectedText}</strong>`
        break
      case "italic":
        formattedText = `<em>${selectedText}</em>`
        break
      case "link":
        const url = prompt("Enter URL:", "https://")
        if (url) {
          formattedText = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${selectedText}</a>`
        } else {
          return
        }
        break
      case "list":
        formattedText = `<ul class="list-disc pl-5 my-2"><li>${selectedText}</li></ul>`
        break
      default:
        return
    }

    // Create a temporary div to hold the current content
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = editContent

    // Create a range in the temp div that matches the selection
    const tempRange = document.createRange()
    tempRange.setStart(range.startContainer, range.startOffset)
    tempRange.setEnd(range.endContainer, range.endOffset)

    // Replace the selected text with the formatted text
    tempRange.deleteContents()
    const fragment = tempRange.createContextualFragment(formattedText)
    tempRange.insertNode(fragment)

    // Update the edit content
    setEditContent(tempDiv.innerHTML)
  }

  const addEmoji = (emoji: string) => {
    if (!editingNoteId || !editorRef.current) return
    setEditContent(editContent + emoji)
  }

  // Get color class for a note
  const getNoteColorClass = (colorName = "default") => {
    return NOTE_COLORS.find((c) => c.name === colorName)?.value || NOTE_COLORS[0].value
  }

  // Get text color class for a note
  const getNoteTextColorClass = (colorName = "default") => {
    return NOTE_COLORS.find((c) => c.name === colorName)?.textColor || NOTE_COLORS[0].textColor
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const editorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="space-y-6">
      {/* Add Note Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddNote}
          size="sm"
          className="transition-all hover:scale-105 active:scale-95 bg-[#34A853] hover:bg-[#2D9249] text-white border-none shadow-sm rounded-full"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>New Note</span>
        </Button>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editingNoteId && editorMounted && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={editorVariants}>
            <Card className="mb-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-2 mb-3 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                  {/* Format buttons */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFormatText("bold")}
                    className="h-8 px-3 rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFormatText("italic")}
                    className="h-8 px-3 rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFormatText("link")}
                    className="h-8 px-3 rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    title="Add Link"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFormatText("list")}
                    className="h-8 px-3 rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    title="Add List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>

                  <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-600 mx-1"></div>

                  {/* Color selector */}
                  <div className="flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 mr-1" />
                    <div className="flex gap-1">
                      {NOTE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-5 h-5 rounded-full transition-all ${
                            selectedColor === color.name
                              ? "ring-2 ring-zinc-300 dark:ring-zinc-500 scale-110"
                              : "hover:scale-110"
                          } ${color.value}`}
                          title={`${color.name.charAt(0).toUpperCase() + color.name.slice(1)} theme`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Emoji shortcuts */}
                  <div className="ml-auto flex flex-wrap gap-1">
                    {["💪", "🏋️", "🏃", "✅", "⚠️", "🔥"].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-110"
                        onClick={() => addEmoji(emoji)}
                        title={`Add ${emoji} emoji`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Editor area */}
                <div
                  ref={editorRef}
                  className={`min-h-[180px] border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#34A853] ${getNoteColorClass(
                    selectedColor,
                  )} ${getNoteTextColorClass(selectedColor)} overflow-auto`}
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: editContent }}
                  onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                  onBlur={(e) => setEditContent(e.currentTarget.innerHTML)}
                />

                {/* Action buttons */}
                <div className="flex justify-end mt-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNoteId(null)}
                    className="rounded-md border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    className="rounded-md bg-[#34A853] hover:bg-[#2D9249] text-white border-none"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      <ScrollArea className="h-[calc(100vh-280px)] sm:h-[500px] pr-4">
        <motion.div className="space-y-4" initial="hidden" animate="visible" variants={containerVariants}>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <motion.div key={note.id} variants={itemVariants}>
                <Card
                  className={`border border-zinc-200 dark:border-zinc-800 ${getNoteColorClass(
                    note.color,
                  )} hover:shadow-md transition-all duration-300 shadow-sm relative overflow-hidden`}
                >
                  <CardContent className="p-4 relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 dark:bg-black/20">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span className={`text-sm ${getNoteTextColorClass(note.color)}`}>
                          {formatDate(note.updatedAt)}
                        </span>

                        {note.category && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-xs">
                            <Tag className="h-3 w-3" />
                            <span>{note.category}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="h-8 px-3 rounded-md transition-all hover:bg-white/20 dark:hover:bg-black/20"
                        >
                          Edit
                        </Button>
                        {note.id !== "default-guidelines" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 px-3 rounded-md transition-all hover:bg-white/20 dark:hover:bg-black/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div
                      className={`prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-a:text-blue-400 prose-strong:text-inherit prose-em:text-inherit/80 overflow-auto ${getNoteTextColorClass(
                        note.color,
                      )}`}
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400"
              variants={itemVariants}
            >
              <div className="relative w-16 h-16 mb-4">
                <Sparkles className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-center">No notes yet. Create your first note!</p>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>
    </div>
  )
}
