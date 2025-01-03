"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react"; // Import Lucide icons for moon and sun

const HeaderDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the menu visibility
  const [isDarkMode, setIsDarkMode] = useState(false); // State for managing dark mode

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for preferred theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to dark mode if no preference is stored
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // Redirect to the homepage after signing out
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <header className="shadow-sm">
      <nav className="container p-4 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Minimo
          </Link>
        </div>

        {/* Mobile menu and dark mode toggle */}
        <div className="sm:hidden flex items-center justify-between w-full">
          {/* Dark mode toggle button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-800 dark:text-white"
          >
            {isDarkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-blue-400" />
            )}
          </button>

          {/* Hamburger icon */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center space-x-4">
          {loading ? (
            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span
                className={`text-gray-600 ${isDarkMode ? "text-white" : ""}`}
              >
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span className="text-gray-600">Not signed in</span>
          )}

          {/* Dark/Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 hover:dark:bg-gray-900"
          >
            {isDarkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-blue-400" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } sm:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4`}
        >
          {loading ? (
            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex flex-col space-y-4">
              <span className={`text-gray-600 dark:text-white`}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span className="text-gray-600">Not signed in</span>
          )}

          {/* Dark/Light Mode Toggle Button (Mobile) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-blue-400" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default HeaderDashboard;
