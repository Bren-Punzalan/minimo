"use client";

import { redirect } from "next/navigation";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { createClient } from "./utils/supabase/client";
import { useEffect } from "react";

export default function Home() {
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // If the user is authenticated, redirect to the dashboard
        redirect("/dashboard");
      }
    };

    checkAuth();
  }, [supabase]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
