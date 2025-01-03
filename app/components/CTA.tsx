"use client";
import { createClient } from "../utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function CTA() {
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
    <div className="bg-indigo-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8 lg:mb-0">
          <span className="block mb-1">Ready to dive in?</span>
          <span className="block text-indigo-600">Start free today.</span>
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:mt-0 lg:flex-shrink-0 lg:justify-start">
          <div className="mb-4 sm:mb-0 sm:mr-3">
            <Button
              onClick={handleSignIn}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 h-14 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
