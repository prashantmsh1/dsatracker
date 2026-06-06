"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    Circle,
    Activity,
    Terminal,
    Sparkles
} from "lucide-react";

interface MockProblem {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    category: string;
    completed: boolean;
    type: string;
}

const initialMockProblems: MockProblem[] = [
    {
        id: 1,
        title: "Reverse a Linked List",
        difficulty: "Easy",
        category: "Linked List",
        completed: false,
        type: "Solve"
    },
    {
        id: 2,
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        category: "String / DP",
        completed: false,
        type: "Review"
    },
    {
        id: 3,
        title: "LRU Cache Design",
        difficulty: "Hard",
        category: "Design",
        completed: false,
        type: "Critical"
    }
];

export function DashboardSimulator() {
    const [mockProblems, setMockProblems] = useState<MockProblem[]>(initialMockProblems);
    const [simulatedStreak, setSimulatedStreak] = useState(4);
    const [logs, setLogs] = useState<string[]>(["Daily recommendations loaded"]);

    const toggleProblem = (id: number) => {
        setMockProblems(prev => {
            const updated = prev.map(p => {
                if (p.id === id) {
                    const nextState = !p.completed;
                    const logMessage = nextState
                        ? `Solved "${p.title}"! +10 XP added.`
                        : `Marked "${p.title}" as incomplete.`;
                    setLogs(l => [logMessage, ...l.slice(0, 4)]);
                    return { ...p, completed: nextState };
                }
                return p;
            });
            
            const allDone = updated.every(p => p.completed);
            if (allDone) {
                setSimulatedStreak(5);
                setLogs(l => ["🔥 Streak extended! Today's daily targets achieved.", ...l.slice(0, 4)]);
            } else {
                setSimulatedStreak(4);
            }
            return updated;
        });
    };

    const solvedCount = mockProblems.filter(p => p.completed).length;
    const progressPercent = Math.round((solvedCount / mockProblems.length) * 100);

    return (
        <div className="relative rounded-2xl border border-border/60 bg-card/60 dark:bg-zinc-950/40 backdrop-blur-xl shadow-2xl p-6 md:p-8 animate-float">
            {/* Header / Meta Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-6 mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Activity className="size-5 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Daily Tracker Control</h3>
                        <p className="text-xs text-muted-foreground">Mocking Active Session • User: visitor@dsaflow.io</p>
                    </div>
                </div>
                
                {/* Stats Widgets */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Active Streak</span>
                        <span className="text-lg font-extrabold text-amber-500 flex items-center gap-1.5 justify-end">
                            🔥 {simulatedStreak} days
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Progress Today</span>
                        <span className="text-lg font-extrabold text-cyan-500">
                            {solvedCount}/3 Solved
                        </span>
                    </div>
                </div>
            </div>

            {/* Split Content (List vs Terminal) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Problems Checklist */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Recommendations</h4>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                            Resetting in 3h
                        </span>
                    </div>

                    <ul className="space-y-3">
                        {mockProblems.map((problem) => (
                            <li 
                                key={problem.id}
                                onClick={() => toggleProblem(problem.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                    problem.completed 
                                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-inner" 
                                        : "bg-background/80 hover:bg-muted/40 border-border/80 hover:border-cyan-500/30"
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="text-muted-foreground hover:text-foreground shrink-0 focus:outline-none">
                                        {problem.completed ? (
                                            <CheckCircle2 className="size-6 text-emerald-500 fill-emerald-500/10" />
                                        ) : (
                                            <Circle className="size-6 text-muted-foreground/60" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-semibold text-sm transition-all truncate ${problem.completed ? "line-through text-muted-foreground/70" : "text-foreground"}`}>
                                            {problem.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-medium text-muted-foreground">
                                                {problem.category}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                                problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                "bg-red-500/10 text-red-600 dark:text-red-400"
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                        problem.type === "Solve" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" :
                                        problem.type === "Review" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                        "bg-lime-500/10 text-lime-600 dark:text-lime-400"
                                    }`}>
                                        {problem.type}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Progress Details & Logs Terminal */}
                <div className="space-y-6 flex flex-col justify-between">
                    <div className="bg-background/60 dark:bg-zinc-900/60 p-5 rounded-xl border border-border/40">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Progress Analytics</h4>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>Task Completion</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full transition-all duration-500" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-muted/30 p-2.5 rounded-lg border border-border/10">
                                <span className="text-[10px] text-muted-foreground block uppercase font-bold">XP Gained</span>
                                <span className="text-base font-extrabold text-emerald-500">+{solvedCount * 10}</span>
                            </div>
                            <div className="bg-muted/30 p-2.5 rounded-lg border border-border/10">
                                <span className="text-[10px] text-muted-foreground block uppercase font-bold">15d Window</span>
                                <span className="text-base font-extrabold text-cyan-500">Secured</span>
                            </div>
                        </div>
                    </div>

                    {/* Console Log terminal */}
                    <div className="bg-zinc-950 text-zinc-400 p-4 rounded-xl border border-zinc-800 font-mono text-[11px] leading-relaxed flex-1 flex flex-col min-h-[120px]">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-2 shrink-0">
                            <Terminal className="size-3.5 text-cyan-500" />
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Simulator Logs</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-1.5 items-start animate-fade-in">
                                    <span className="text-zinc-600 font-semibold">&gt;</span>
                                    <p className={index === 0 ? "text-zinc-200" : "text-zinc-500"}>
                                        {log}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tooltip Callout */}
            <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/30 pt-4 flex items-center justify-center gap-1.5">
                <Sparkles className="size-3.5 text-cyan-500" />
                <span>Try checking off items above to experience the dynamic visual feedback!</span>
            </div>
        </div>
    );
}
