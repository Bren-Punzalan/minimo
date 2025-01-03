"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../utils/supabase/client";
import { Check, X, Edit, Trash } from "lucide-react";
import { format } from "date-fns";

const supabase = createClient();

interface Note {
  id: number;
  note_text: string;
  created_at: string;
  user_id: string;
}

interface ViewNotesDialogProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onClose: () => void;
  focusedNoteId?: number | null; // Optional focused note ID
}

export default function ViewNotesDialog({
  notes,
  setNotes,
  onClose,
  focusedNoteId,
}: ViewNotesDialogProps) {
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const noteRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const startEditing = (id: number, currentText: string) => {
    setEditingNote(id);
    setEditedText(currentText);
  };

  const confirmEdit = async (id: number) => {
    const { error } = await supabase
      .from("quick_notes")
      .update({ note_text: editedText })
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, note_text: editedText } : note
        )
      );
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditedText("");
  };

  const deleteNote = async (id: number) => {
    const { error } = await supabase.from("quick_notes").delete().eq("id", id);

    if (error) {
      console.error(error);
    } else {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
  };

  useEffect(() => {
    if (focusedNoteId && noteRefs.current[focusedNoteId]) {
      noteRefs.current[focusedNoteId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedNoteId]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full max-h-[80vh] overflow-y-auto p-4 px-12">
        <DialogHeader>
          <DialogTitle>Your Notes</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              ref={(el) => {
                noteRefs.current[note.id] = el; // Assign to the ref object
              }}
              className={`relative p-4 rounded-lg border shadow-md hover:shadow-lg group ${
                focusedNoteId === note.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                  : ""
              }`}
            >
              {editingNote !== note.id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(note.id, note.note_text)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash className="w-5 h-5" />
                  </Button>
                </div>
              )}

              <div className="flex flex-col justify-between h-full">
                {editingNote === note.id ? (
                  <>
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmEdit(note.id)}
                        className="flex items-center"
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex items-center"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-white line-clamp-3">
                    {note.note_text}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {format(new Date(note.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
