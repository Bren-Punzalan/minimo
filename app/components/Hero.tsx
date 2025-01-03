"use client";

import { createClient } from "../utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:3000/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-8 mb-8 lg:mb-0">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Simplify your workflow with{" "}
            <span className="text-indigo-600">Minimo</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Boost your productivity with our minimalistic and intuitive web app.
            Focus on what matters most.
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-start">
            <div className="rounded-md shadow">
              <Button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center px-8 h-15 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <img
            className="w-full h-auto max-w-md mx-auto lg:max-w-full object-cover  "
            src="/images/Group233.png"
            alt="Minimo app screenshot"
          />
        </div>
      </div>
    </div>
  );
}
