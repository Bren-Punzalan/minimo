"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../utils/supabase/client";
import ViewNotesDialog from "./viewNotesDialog";
import { Skeleton } from "@/components/ui/skeleton";

const supabase = createClient();

interface Note {
  id: number;
  note_text: string;
  created_at: string;
  user_id: string;
}

export default function NotesTaking() {
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [todayNotes, setTodayNotes] = useState<Note[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [focusedNoteId, setFocusedNoteId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
    setUserId(user.user.id);
  };

  const saveNote = async () => {
    if (!note.trim() || !userId) return;

    const { data, error } = await supabase
      .from("quick_notes")
      .insert([{ note_text: note, user_id: userId }])
      .select();

    if (error) {
      console.error(error);
    } else if (data) {
      setNotes((prev) => [...prev, data[0]]);
      setNote("");
    }
  };

  const fetchNotes = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("quick_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      setNotes(data as Note[]);
    }
    setLoading(false);
  };

  const filterTodayNotes = () => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = notes.filter(
      (note) => new Date(note.created_at).toISOString().split("T")[0] === today
    );
    setTodayNotes(filtered);
  };

  const handleNoteClick = (noteId: number) => {
    setFocusedNoteId(noteId);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  useEffect(() => {
    filterTodayNotes();
  }, [notes]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Quick Notes</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          View All Notes
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your notes here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[200px] mb-4"
        />
        <Button onClick={saveNote} className="w-full">
          Save Note
        </Button>
      </CardContent>

      <CardContent className="mt-4">
        <h2 className="text-lg font-bold mb-2">Notes Added Today</h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        ) : todayNotes.length > 0 ? (
          <div className="space-y-2">
            {todayNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="block w-full text-left px-4 py-2 rounded-lg border hover:bg-gray-900 duration-200"
              >
                {note.note_text}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No notes added today.</p>
        )}
      </CardContent>

      {dialogOpen && (
        <ViewNotesDialog
          notes={notes}
          setNotes={setNotes}
          focusedNoteId={focusedNoteId}
          onClose={() => {
            setDialogOpen(false);
            setFocusedNoteId(null);
          }}
        />
      )}
    </Card>
  );
}
