"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Dumbbell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navItemClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-cyan-100 text-cyan-700"
        : "text-slate-600 hover:text-cyan-600 hover:bg-slate-50"
    }`;

  const mobileNavItemClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive(path)
        ? "bg-cyan-100 text-cyan-700"
        : "text-slate-600 hover:text-cyan-600 hover:bg-slate-50"
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-cyan-600" />
              <span className="text-xl font-bold text-slate-900">
                Get Your Fit Together
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              // Authenticated Navigation
              <>
                <Link href="/" className={navItemClass("/")}>
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link href="/dashboard" className={navItemClass("/dashboard")}>
                  <Dumbbell className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/favorites"
                  className={navItemClass("/dashboard/favorites")}
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={navItemClass("/dashboard/profile")}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <div className="h-6 w-px bg-slate-300 mx-2" />
                <span className="text-sm text-slate-500 px-3">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              // Unauthenticated Navigation
              <>
                <Link href="/" className={navItemClass("/")}>
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link href="/login" className={navItemClass("/login")}>
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>
                <Link href="/signup" className={navItemClass("/signup")}>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200">
              {user ? (
                // Authenticated Mobile Navigation
                <>
                  <Link
                    href="/"
                    className={mobileNavItemClass("/")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className={mobileNavItemClass("/dashboard")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Dumbbell className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/favorites"
                    className={mobileNavItemClass("/dashboard/favorites")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className={mobileNavItemClass("/dashboard/profile")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <div className="px-3 py-2 text-sm text-slate-500 border-t border-slate-200 mt-2">
                    {user.email}
                  </div>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                // Unauthenticated Mobile Navigation
                <>
                  <Link
                    href="/"
                    className={mobileNavItemClass("/")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    href="/login"
                    className={mobileNavItemClass("/login")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className={mobileNavItemClass("/signup")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
