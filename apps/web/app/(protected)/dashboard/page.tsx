"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPlaylists } from "@/lib/api/playlists";
import { AddProblemDialog } from "@/components/dashboard/add-problem-dialog";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, ChartBarStacked, Code2, FolderKanban, Home, Settings } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProblemsView } from "@/components/dashboard/problems-view";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DashboardNavbar,
    type DashboardNavbarOption,
} from "@/components/dashboard/dashboard-navbar";
import {
    DashboardSidebar,
    type DashboardSidebarMenuItem,
} from "@/components/dashboard/dashboard-sidebar";
import PlaylistData from "@/components/dashboard/playlist-data";
import { PlaylistQuestionsView } from "@/components/dashboard/playlist-questions-view";

const sidebarMenuItems: DashboardSidebarMenuItem[] = [
    { label: "Overview", href: "/dashboard", icon: Home },
    {
        label: "Problems",
        href: "/dashboard?view=problems",
        icon: Code2,
        badge: "142",
    },
    {
        label: "Playlists",
        href: "/dashboard?view=playlists",
        icon: FolderKanban,
        badge: "6",
    },
    {
        label: "Progress",
        href: "/dashboard?view=progress",
        icon: ChartBarStacked,
    },
    { label: "Settings", href: "/dashboard?view=settings", icon: Settings },
];

const navbarOptions: DashboardNavbarOption[] = [
    { label: "Calendar", href: "/dashboard?view=calendar", icon: CalendarClock },
    { label: "Roadmap", href: "/dashboard?view=roadmap", icon: ChartBarStacked },
];

type StatCard = {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
};

// statCards removed as they are now dynamic in DashboardOverview

import { getDashboardStats, getDailyPlan } from "@/lib/api/dashboard";

function DashboardOverview() {
    const { user } = useAuth();

    const statsQuery = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: getDashboardStats,
        enabled: Boolean(user),
    });

    const dailyPlanQuery = useQuery({
        queryKey: ["daily-plan"],
        queryFn: getDailyPlan,
        enabled: Boolean(user),
    });

    if (statsQuery.isLoading || dailyPlanQuery.isLoading) {
        return (
            <>
                <section className="rounded-xl border bg-card p-5">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </section>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </section>
                <section className="rounded-xl border bg-card p-5">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </section>
            </>
        );
    }

    const stats = statsQuery.data;
    const dailyPlan = dailyPlanQuery.data ?? [];

    const dynamicStatCards: StatCard[] = [
        { 
          label: "Solved", 
          value: stats?.totalSolved?.toString() ?? "0", 
          hint: stats?.hint ?? "+0 this week", 
          icon: Code2 
        },
        { 
          label: "Playlists", 
          value: stats?.totalPlaylists?.toString() ?? "0", 
          hint: "Active collections", 
          icon: FolderKanban 
        },
        {
            label: "Streak",
            value: `${stats?.activeStreak ?? 0} days`,
            hint: "Keep it up!",
            icon: CalendarClock,
        },
    ];

    return (
        <>
            <section className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h2 className="mt-1 text-2xl font-semibold">
                    {dailyPlan.length > 0 
                      ? "Ready for today's problem set?" 
                      : "Start building your study track"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {dailyPlan.length > 0 
                      ? `You have ${dailyPlan.length} goals for today. Focus on consistency to build mastery.`
                      : "Add problems from the library to your playlists to generate your personalized daily plan."}
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {dynamicStatCards.map((card) => (
                    <article key={card.label} className="rounded-xl border bg-card p-5 transition-all hover:shadow-md border-border/50">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <card.icon className="size-4 text-primary/60" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
                        <p className="mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">{card.hint}</p>
                    </article>
                ))}
            </section>

            <section className="rounded-xl border bg-card p-5">
                <h3 className="text-base font-semibold">Today&apos;s plan</h3>
                <ul className="mt-4 space-y-3 text-sm">
                    {dailyPlan.map((item) => (
                        <li key={item.id} className="group relative rounded-lg border bg-background px-4 py-3 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={`text-[10px] py-0 h-5 border-none bg-muted/50 ${
                                    item.type === "Solve" ? "text-emerald-600" : 
                                    item.type === "Review" ? "text-rose-600" : "text-amber-600"
                                  }`}>
                                    {item.type}
                                  </Badge>
                                  <a href={item.url} target="_blank" rel="noreferrer" className="font-medium hover:text-primary transition-colors">
                                    {item.title}
                                  </a>
                                </div>
                                <Badge variant="secondary" className="text-[10px] opacity-60">
                                    {item.difficulty}
                                </Badge>
                            </div>
                        </li>
                    ))}
                    {dailyPlan.length === 0 && (
                        <li className="text-center py-6 text-muted-foreground border-dashed border-2 rounded-lg">
                           No goals set yet. Add problems to playlists to get started.
                        </li>
                    )}
                </ul>
            </section>
        </>
    );
}

// DashboardPlaceholder removed as it's no longer used

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
    const view = searchParams.get("view") ?? "overview";
    const playlistId = Number(searchParams.get("id"));

    const playlistsQuery = useQuery({
        queryKey: ["playlists"],
        queryFn: getPlaylists,
        enabled: Boolean(user),
    });

    const title =
        view === "overview" ? "Dashboard" : 
        view === "playlist" ? "Playlist Details" :
        `${view.slice(0, 1).toUpperCase()}${view.slice(1)}`;

    return (
        <SidebarProvider>
            <DashboardSidebar menuItems={sidebarMenuItems} />

            <SidebarInset>
                <DashboardNavbar
                    title={title}
                    options={navbarOptions}
                    onAddProblemClick={() => setIsAddProblemModalOpen(true)}
                />

                <main className="flex-1 space-y-6 p-4 md:p-6">
                    {view === "overview" ? <DashboardOverview /> : null}
                    {view === "problems" ? <ProblemsView /> : null}
                    {view === "playlists" ? <PlaylistData /> : null}
                    {view === "playlist" && playlistId ? (
                        <PlaylistQuestionsView 
                            playlistId={playlistId} 
                            playlistName={playlistsQuery.data?.find(p => p.id === playlistId)?.name ?? "Playlist"}
                            onBack={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("view", "playlists");
                                params.delete("id");
                                router.push(`?${params.toString()}`);
                            }}
                        />
                    ) : null}
                </main>
            </SidebarInset>

            <AddProblemDialog
                open={isAddProblemModalOpen}
                onOpenChange={setIsAddProblemModalOpen}
                playlists={playlistsQuery.data ?? []}
                playlistsLoading={playlistsQuery.isLoading}
                isAuthenticated={Boolean(user)}
            />
        </SidebarProvider>
    );
}
