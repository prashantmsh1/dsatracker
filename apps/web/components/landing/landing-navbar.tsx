"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { Button } from "@/components/ui/button";
import { Code2, ArrowRight, Menu, X } from "lucide-react";

export function LandingNavbar() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-200">
            <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105 duration-300">
                        <Code2 className="size-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                        DSA<span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Tracker</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
                    <a href="#simulator" className="hover:text-cyan-500 transition-colors">Interactive Demo</a>
                    <a href="#stats" className="hover:text-teal-500 transition-colors">Statistics</a>
                    <a href="#faq" className="hover:text-emerald-500 transition-colors">FAQ</a>
                </nav>

                {/* Action buttons / Theme Toggle */}
                <div className="hidden md:flex items-center gap-4">
                    <ModeToggle />
                    {loading ? (
                        <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
                    ) : user ? (
                        <Button 
                            onClick={() => router.push("/dashboard")} 
                            className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-medium hover:opacity-95 shadow-md shadow-emerald-500/10 transition-all hover:-translate-y-0.5"
                        >
                            Dashboard <ArrowRight className="size-4 ml-1.5" />
                        </Button>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors px-3 py-2">
                                Sign In
                            </Link>
                            <Button 
                                onClick={() => router.push("/signup")} 
                                className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm transition-all hover:-translate-y-0.5"
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-3">
                    <ModeToggle />
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-border/50 bg-background px-6 py-6 space-y-4 flex flex-col transition-all duration-300">
                    <a 
                        href="#features" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                        Features
                    </a>
                    <a 
                        href="#simulator" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                        Interactive Demo
                    </a>
                    <a 
                        href="#stats" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                        Statistics
                    </a>
                    <a 
                        href="#faq" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                        FAQ
                    </a>
                    <div className="h-px bg-border my-2" />
                    {loading ? (
                        <div className="h-10 bg-muted animate-pulse rounded-lg" />
                    ) : user ? (
                        <Button 
                            onClick={() => { setMobileMenuOpen(false); router.push("/dashboard"); }} 
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        >
                            Go to Dashboard
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link 
                                href="/login" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full py-2.5 text-center font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Button 
                                onClick={() => { setMobileMenuOpen(false); router.push("/signup"); }} 
                                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
