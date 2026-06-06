"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { DashboardSimulator } from "@/components/landing/dashboard-simulator";
import { FeatureCard } from "@/components/landing/feature-card";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
    ArrowRight,
    Sparkles,
    Calendar,
    LineChart,
    Layers,
    ExternalLink,
    TrendingUp,
    Shield,
    Code2
} from "lucide-react";

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const faqItems = [
        {
            q: "How does the daily recommended plan work?",
            a: "Every day at midnight, the system aggregates problems from your active playlists and central playlists, selecting 3 targeted problems based on priority and your solve history to keep your streak alive."
        },
        {
            q: "What is the 15-day non-repeat rule?",
            a: "To ensure you cover a wide array of concepts and don't get stuck in a loop, our scheduler guarantees that no problem recommended in the daily plan will reappear as a recommendation for at least 15 days."
        },
        {
            q: "What are central playlists vs. personal playlists?",
            a: "Central Playlists are curated by the community and administrators for standard tracks (like Top 75, Blind 75, NeetCode 150). Personal Playlists are collections you create yourself to save custom problems you import from external sites."
        },
        {
            q: "Does it track LeetCode and other platforms?",
            a: "Yes. You can import problems from LeetCode, Codeforces, GeeksforGeeks, and others. The scraper automatically fetches metadata, difficulty, and problem statements to centralize your learning notes."
        }
    ];

    const features = [
        {
            title: "Centralized Playlists",
            description: "Access built-in community playlists like Blind 75 and NeetCode. Add recommendations to your daily study queue instantly.",
            icon: Layers,
            borderColorHoverClass: "hover:border-emerald-500/30",
            iconBgColorClass: "bg-emerald-500/10",
            iconColorClass: "text-emerald-600 dark:text-emerald-400"
        },
        {
            title: "15-Day No Repeats",
            description: "Our algorithmic daily scheduler ensures no problem returns for 15 days, promoting wider structural understanding.",
            icon: Calendar,
            borderColorHoverClass: "hover:border-cyan-500/30",
            iconBgColorClass: "bg-cyan-500/10",
            iconColorClass: "text-cyan-600 dark:text-cyan-400"
        },
        {
            title: "Progress Logs & Notes",
            description: "Add customized notes directly underneath solved items, save solutions, code snippets, and review revision statuses.",
            icon: LineChart,
            borderColorHoverClass: "hover:border-teal-500/30",
            iconBgColorClass: "bg-teal-500/10",
            iconColorClass: "text-teal-600 dark:text-teal-400"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-400 transition-colors duration-300 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-500/10 via-teal-500/5 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />

            {/* Mesh Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none -z-20 animate-grid-drift" />

            {/* Floating Header */}
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 flex flex-col items-center text-center max-w-5xl">
                    
                    {/* Premium Top Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
                        <Sparkles className="size-3.5" />
                        <span>The Ultimate DSA Tracker Platform</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
                        Master DSA,{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-pulse-slow">
                            One Day
                        </span>{" "}
                        at a Time
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                        An intelligent, non-repeating daily algorithm scheduler. Curate playlists, write structured notes, track solved histories, and build a consistent streak.
                    </p>

                    {/* Hero CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full sm:w-auto">
                        <Button
                            onClick={() => router.push(user ? "/dashboard" : "/signup")}
                            className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/15 hover:opacity-95 hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
                        >
                            {user ? "Go to Dashboard" : "Start Your Free Track"}
                            <ArrowRight className="size-4.5 ml-2" />
                        </Button>
                        <a
                            href="#simulator"
                            className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center font-semibold border border-border bg-card/60 backdrop-blur-sm rounded-xl text-foreground hover:bg-muted/50 hover:-translate-y-0.5 transition-all"
                        >
                            Try Sandbox Demo
                        </a>
                    </div>
                </div>
            </section>

            {/* Interactive Dashboard Simulator Section */}
            <section id="simulator" className="py-12 md:py-20 relative">
                <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">
                            Interactive Sandbox Simulator
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Experience the system live. Complete recommendations below to watch the dashboard streak and progress updates dynamically.
                        </p>
                    </div>

                    <DashboardSimulator />
                </div>
            </section>

            {/* Features Grid Section */}
            <section id="features" className="py-20 bg-muted/20 border-y border-border/20">
                <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            Core Architecture Built for Success
                        </h2>
                        <p className="text-muted-foreground">
                            Say goodbye to messy spreadsheets. Track playlists, automate reviews, and keep codebase consistency.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                borderColorHoverClass={feature.borderColorHoverClass}
                                iconBgColorClass={feature.iconBgColorClass}
                                iconColorClass={feature.iconColorClass}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Statistics Section */}
            <section id="stats" className="py-20 relative">
                <div className="container mx-auto px-4 md:px-8 max-w-5xl">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-900/60 dark:to-zinc-950/60 text-white rounded-3xl border border-zinc-800 p-8 md:p-12 relative overflow-hidden shadow-xl">
                        
                        {/* Glow orb inside card */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-cyan-500/10 to-transparent blur-[80px] pointer-events-none" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                                    Powering Consistent Engineers Globally
                                </h3>
                                <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                                    Consistency beats intensity. By solving 3 high-quality problems daily rather than cramming 50 in a weekend, you build neuro-connectivity that retains algorithms permanently.
                                </p>
                                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                                    <TrendingUp className="size-4" />
                                    <span>Engineered for Retention</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="border-l-2 border-emerald-500 pl-4 py-1">
                                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight block">15 Days</span>
                                    <span className="text-xs text-zinc-400 block mt-1">Zero problem repetition rule</span>
                                </div>
                                <div className="border-l-2 border-cyan-500 pl-4 py-1">
                                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight block">100%</span>
                                    <span className="text-xs text-zinc-400 block mt-1">Curated central database</span>
                                </div>
                                <div className="border-l-2 border-teal-500 pl-4 py-1">
                                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight block">3 Daily</span>
                                    <span className="text-xs text-zinc-400 block mt-1">Sustainable practice targets</span>
                                </div>
                                <div className="border-l-2 border-lime-500 pl-4 py-1">
                                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight block">Free</span>
                                    <span className="text-xs text-zinc-400 block mt-1">Open source codebase</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expandable Accordion FAQ Section */}
            <section id="faq" className="py-20 bg-muted/10 border-t border-border/10">
                <div className="container mx-auto px-4 md:px-8 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Got questions? We have compiled the core answers here.
                        </p>
                    </div>

                    <FaqAccordion items={faqItems} />
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mx-auto mb-8 animate-float">
                        <Shield className="size-8" />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Ready to Upgrade Your DSA Study Habit?
                    </h2>
                    
                    <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
                        Join other developers tracking their playlists and maintaining streak routines daily. No credit card required.
                    </p>

                    <Button
                        onClick={() => router.push(user ? "/dashboard" : "/signup")}
                        className="h-12 px-8 text-base bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/15 hover:opacity-95 hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
                    >
                        {user ? "Enter Your Dashboard" : "Start Tracking For Free"}
                        <ArrowRight className="size-4.5 ml-2" />
                    </Button>
                </div>
            </section>

            {/* Premium Minimal Footer */}
            <footer className="border-t border-border/40 py-12 bg-background/50 transition-colors duration-200">
                <div className="container mx-auto px-4 md:px-8 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                            <Code2 className="size-4" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-foreground">
                            DSA<span className="text-emerald-500">Tracker</span>
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground text-center md:text-right">
                        © {new Date().getFullYear()} DSATracker. All rights reserved. Designed for consistency and premium utility.
                    </p>

                    <div className="flex gap-6 text-xs text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                            GitHub <ExternalLink className="size-3" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
