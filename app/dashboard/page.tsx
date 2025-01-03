"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/client";

import NotesTaking from "../components/NotesTaking";
import PomodoroTimer from "../components/PomodoroTimer";
import MoodLogger from "../components/MoodLogger";

import HeaderDashboard from "../components/HeaderDashboard";
import TodoList from "../components/TodoList";
import SupportFooter from "../components/SupportFooter";

export default function Dashboard() {
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // If the user is not authenticated, redirect to the homepage
        redirect("/");
      }
    };

    checkAuth();
  }, [supabase]);

  return (
    <>
      <HeaderDashboard />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TodoList />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PomodoroTimer />
              <MoodLogger />
            </div>
          </div>
          <div className="space-y-6">
            <NotesTaking />
          </div>
        </div>
      </div>
      <SupportFooter />
    </>
  );
}
