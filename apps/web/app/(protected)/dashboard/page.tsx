"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPlaylists } from "@/lib/api/playlists";
import { getCentralPlaylists } from "@/lib/api/central";
import { AddProblemDialog } from "@/components/dashboard/add-problem-dialog";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowUpRight,
    CalendarClock,
    ChartBarStacked,
    Code2,
    FolderKanban,
    Home,
    Settings,
    Loader2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProblemsView } from "@/components/dashboard/problems-view";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import { CreatePlaylistDialog } from "@/components/dashboard/create-playlist-dialog";
import { ProblemDetailView } from "@/components/dashboard/problem-detail-view";
import { ProgressView } from "@/components/dashboard/progress-view";
import { SettingsView } from "@/components/dashboard/settings-view";

const sidebarMenuItems: DashboardSidebarMenuItem[] = [
    { label: "Overview", href: "/dashboard", icon: Home },
    {
        label: "Problems",
        href: "/dashboard?view=problems",
        icon: Code2,
    },
    {
        label: "Playlists",
        href: "/dashboard?view=playlists",
        icon: FolderKanban,
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
    const router = useRouter();
    const searchParams = useSearchParams();

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
            icon: Code2,
        },
        {
            label: "Playlists",
            value: stats?.totalPlaylists?.toString() ?? "0",
            hint: "Active collections",
            icon: FolderKanban,
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
                    <article
                        key={card.label}
                        className="rounded-xl border bg-card p-5 transition-all hover:shadow-md border-border/50">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <card.icon className="size-4 text-primary/60" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
                        <p className="mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                            {card.hint}
                        </p>
                    </article>
                ))}
            </section>

            <section className="rounded-xl border bg-card/50 overflow-hidden">
                <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold">Today&apos;s Plan</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Recommended problems for your daily streak
                        </p>
                    </div>
                </div>

                <div className="p-2">
                    <ul className="space-y-1">
                        {dailyPlan.map((item) => (
                            <li
                                key={item.id}
                                className="group relative flex items-center justify-between rounded-lg border border-transparent bg-background/50 px-4 py-3 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className={`flex items-center justify-center size-9 rounded-full border bg-white shadow-sm shrink-0 ${
                                            item.type === "Solve"
                                                ? "text-emerald-600 border-emerald-100"
                                                : item.type === "Review"
                                                  ? "text-rose-600 border-rose-100"
                                                  : "text-amber-600 border-amber-100"
                                        }`}>
                                        <Code2 className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set("view", "problem");
                                                    params.set("problemId", item.id.toString());
                                                    params.set("from", "overview");
                                                    params.set("type", "central");
                                                    router.push(`?${params.toString()}`);
                                                }}
                                                className="font-semibold text-sm hover:text-primary transition-colors truncate text-left cursor-pointer hover:underline decoration-primary/30 underline-offset-2">
                                                {item.title}
                                            </button>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] py-0 h-4 border-none ${
                                                    item.difficulty === "Easy"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : item.difficulty === "Medium"
                                                          ? "bg-amber-50 text-amber-700"
                                                          : "bg-rose-50 text-rose-700"
                                                }`}>
                                                {item.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {item.type} session recommended
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        variant="default"
                                        size="xs"
                                        className={`gap-1.5 shadow-sm text-[11px] h-7 ${
                                            item.type === "Solve"
                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                : item.type === "Review"
                                                  ? "bg-rose-600 hover:bg-rose-700"
                                                  : "bg-amber-600 hover:bg-amber-700"
                                        }`}
                                        nativeButton={false}
                                        render={
                                            <a href={item.url} target="_blank" rel="noreferrer" />
                                        }>
                                        <span>{item.type}</span>
                                        <ArrowUpRight className="size-3" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                        {dailyPlan.length === 0 && (
                            <li className="flex flex-col items-center justify-center py-10 text-muted-foreground rounded-lg border-2 border-dashed border-border/40 bg-muted/5 m-2">
                                <p className="text-sm font-medium">No active goals found</p>
                                <p className="text-xs mt-1">
                                    Add problems to your playlists to generate a plan
                                </p>
                            </li>
                        )}
                    </ul>
                </div>
            </section>
        </>
    );
}

// DashboardPlaceholder removed as it's no longer used

function DashboardPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
    const view = searchParams.get("view") ?? "overview";
    const playlistId = Number(searchParams.get("id"));
    const problemId = Number(searchParams.get("problemId"));

    const playlistsQuery = useQuery({
        queryKey: ["playlists"],
        queryFn: getPlaylists,
        enabled: Boolean(user),
    });

    const centralPlaylistsQuery = useQuery({
        queryKey: ["central-playlists"],
        queryFn: getCentralPlaylists,
        enabled: Boolean(user),
    });

    const title =
        view === "overview"
            ? "Dashboard"
            : view === "playlist"
              ? "Playlist Details"
              : view === "problem"
                ? "Problem Details"
                : `${view.slice(0, 1).toUpperCase()}${view.slice(1)}`;

    return (
        <SidebarProvider>
            <DashboardSidebar menuItems={sidebarMenuItems} />

            <SidebarInset>
                <DashboardNavbar
                    title={title}
                    options={navbarOptions}
                    onAddProblemClick={() => setIsAddProblemModalOpen(true)}
                    onAddPlaylistClick={
                        view === "playlists" ? () => setIsCreatePlaylistModalOpen(true) : undefined
                    }
                />

                <main className="flex-1 space-y-6 p-4 md:p-6">
                    {view === "overview" ? <DashboardOverview /> : null}
                    {view === "problems" ? <ProblemsView /> : null}
                    {view === "progress" ? <ProgressView /> : null}
                    {view === "settings" ? <SettingsView /> : null}
                    {view === "playlists" ? (
                        <PlaylistData
                            onCreatePlaylistClick={() => setIsCreatePlaylistModalOpen(true)}
                        />
                    ) : null}
                    {view === "playlist" && playlistId ? (
                        <PlaylistQuestionsView
                            playlistId={playlistId}
                            isCentral={searchParams.get("playlistType") === "central"}
                            playlistName={
                                searchParams.get("playlistType") === "central"
                                    ? (centralPlaylistsQuery.data?.find((p) => p.id === playlistId)?.name ?? "Playlist")
                                    : (playlistsQuery.data?.find((p) => p.id === playlistId)?.name ?? "Playlist")
                            }
                            theory={
                                searchParams.get("playlistType") === "central"
                                    ? (centralPlaylistsQuery.data?.find((p) => p.id === playlistId)?.theory ?? "")
                                    : (playlistsQuery.data?.find((p) => p.id === playlistId)?.theory ?? "")
                            }
                            onBack={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("view", "playlists");
                                params.delete("id");
                                params.delete("playlistType");
                                router.push(`?${params.toString()}`);
                            }}
                        />
                    ) : null}
                    {view === "problem" && problemId ? (
                        <ProblemDetailView
                            problemId={problemId}
                            isCentral={searchParams.get("type") === "central"}
                            onBack={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                const prevView = searchParams.get("from") || "problems";
                                params.set("view", prevView);
                                params.delete("problemId");
                                params.delete("from");
                                params.delete("type");
                                const savedPlaylistId = searchParams.get("playlistId");
                                if (prevView === "playlist" && savedPlaylistId) {
                                    params.set("id", savedPlaylistId);
                                    params.delete("playlistId");
                                }
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

            <CreatePlaylistDialog
                open={isCreatePlaylistModalOpen}
                onOpenChange={setIsCreatePlaylistModalOpen}
                isAuthenticated={Boolean(user)}
            />
        </SidebarProvider>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-100">
                <Loader2 className="size-8 animate-spin text-blue-500" />
            </div>
        }>
            <DashboardPageContent />
        </Suspense>
    );
}
