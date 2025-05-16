"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BriefcaseIcon, UserIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
  ];

  const employerLinks = [
    { href: "/dashboard/employer", label: "Dashboard" },
    { href: "/dashboard/employer/create", label: "Post Job" },
  ];

  const jobSeekerLinks = [
    { href: "/dashboard/job-seeker", label: "Dashboard" },
    { href: "/dashboard/job-seeker/applications", label: "My Applications" },
  ];

  const getNavLinks = () => {
    const links = [...navLinks];
    
    if (session?.user) {
      if (session.user.role === "employer") {
        links.push(...employerLinks);
      } else if (session.user.role === "jobSeeker") {
        links.push(...jobSeekerLinks);
      }
    }
    
    return links;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">JobHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session.user.name}
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.user.role === "employer" ? "Employer" : "Job Seeker"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={session.user.role === "employer" ? "/dashboard/employer" : "/dashboard/job-seeker"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 px-3 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {status === "authenticated" ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-base font-medium text-gray-800">{session.user.name}</p>
                      <p className="text-sm font-medium text-gray-500 mt-1">
                        {session.user.role === "employer" ? "Employer" : "Job Seeker"}
                      </p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Link
                        href={session.user.role === "employer" ? "/dashboard/employer" : "/dashboard/job-seeker"}
                        className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full text-left py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 space-y-2 px-3">
                    <Button asChild variant="outline" className="w-full justify-center">
                      <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-center">
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}