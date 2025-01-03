"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://minimo-pi.vercel.app/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Minimo
          </Link>
        </div>
        {/* Conditionally render navigation links */}
        {!user && !loading && (
          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-800"
              >
                Features
              </Link>
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-800"
              >
                Support Me
              </Link>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center space-x-2"
            >
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
