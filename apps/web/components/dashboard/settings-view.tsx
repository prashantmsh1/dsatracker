"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Target,
  User,
  ShieldCheck,
  Calendar,
  Save,
  Loader2,
} from "lucide-react";
import { getUserSettings, updateUserSettings } from "@/lib/api/auth";

export function SettingsView() {
  const queryClient = useQueryClient();
  const { theme: currentTheme, setTheme } = useTheme();

  // Settings State
  const [displayName, setDisplayName] = useState("");
  const [themeState, setThemeState] = useState("system");
  const [preferredDifficulty, setPreferredDifficulty] = useState("all");
  const [dailyTarget, setDailyTarget] = useState(3);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [cooldownDays, setCooldownDays] = useState(7);

  // Fetch settings query
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["user-settings"],
    queryFn: getUserSettings,
  });

  // Sync state with fetched settings
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName ?? "");
      setThemeState(settings.theme ?? "system");
      setPreferredDifficulty(settings.preferredDifficulty ?? "all");
      setDailyTarget(settings.dailyTarget ?? 3);
      setWeeklyGoal(settings.weeklyGoal ?? 5);
      setCooldownDays(settings.cooldownDays ?? 7);
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-settings"], data);
      toast.success("Settings saved successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update settings. Please try again.");
    },
  });

  const handleSave = () => {
    // Basic validation
    if (displayName.trim().length === 0) {
      toast.error("Display name cannot be empty");
      return;
    }

    // Update next-theme configuration instantly
    setTheme(themeState);

    // Call update mutation
    updateSettingsMutation.mutate({
      displayName: displayName.trim(),
      theme: themeState,
      preferredDifficulty,
      dailyTarget,
      weeklyGoal,
      cooldownDays,
    });
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun, desc: "Classic bright mode" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Sleek low-light mode" },
    { value: "system", label: "System", icon: Sparkles, desc: "Follow system settings" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border bg-card p-5">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </section>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border bg-card">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">Failed to load user settings</p>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page or checking your connection.</p>
        <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["user-settings"] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header section with Save action */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-card p-5 border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Preferences & Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your personalized learning goals, cooldowns, and interface.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md active:scale-98 shrink-0"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile and Appearance Card */}
        <Card className="border border-border/40 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <User className="size-4 text-primary" />
              <span>Profile & Theme</span>
            </CardTitle>
            <CardDescription>
              Manage your display identity and application appearance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Display Name Input */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="max-w-md bg-background/50"
              />
            </div>

            {/* Email (Read only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/40 max-w-md border border-border/20 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span className="truncate">{settings.email}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/80">
                Email is managed through your Firebase login provider.
              </p>
            </div>

            {/* Custom Theme Cards Grid */}
            <div className="space-y-2 border-t pt-4 border-border/30">
              <Label className="text-sm font-medium">Theme Preference</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = themeState === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setThemeState(opt.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer select-none group relative ${
                        isActive
                          ? "bg-primary/5 text-primary border-primary ring-1 ring-primary"
                          : "bg-background/40 hover:bg-muted/40 border-border/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className={`size-5 mb-1.5 transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Algorithm & Targets Card */}
        <Card className="border border-border/40 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              <span>DSA Preferences</span>
            </CardTitle>
            <CardDescription>
              Fine-tune the recommendation algorithm and track your active goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="preferredDifficulty" className="text-sm font-medium">Preferred Difficulty</Label>
              <div className="w-full">
                <Select
                  value={preferredDifficulty}
                  onValueChange={(val) => setPreferredDifficulty(val ?? "all")}
                >
                  <SelectTrigger className="w-full bg-background/50 h-9">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy Only</SelectItem>
                    <SelectItem value="medium">Medium Only</SelectItem>
                    <SelectItem value="hard">Hard Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Filters your daily planner questions to stay inside your preferred tier.
              </p>
            </div>

            {/* Daily Target Slider */}
            <div className="space-y-2 border-t pt-4 border-border/30">
              <div className="flex justify-between items-center">
                <Label htmlFor="dailyTarget" className="text-sm font-medium flex items-center gap-1.5">
                  <Target className="size-4 text-primary/70" />
                  <span>Daily Target</span>
                </Label>
                <span className="text-xs font-bold py-0.5 px-2 bg-primary/10 text-primary rounded-full">
                  {dailyTarget} problems / day
                </span>
              </div>
              <input
                id="dailyTarget"
                type="range"
                min="1"
                max="10"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Weekly Goal Slider */}
            <div className="space-y-2 border-t pt-4 border-border/30">
              <div className="flex justify-between items-center">
                <Label htmlFor="weeklyGoal" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary/70" />
                  <span>Weekly Goal</span>
                </Label>
                <span className="text-xs font-bold py-0.5 px-2 bg-primary/10 text-primary rounded-full">
                  {weeklyGoal} active days / week
                </span>
              </div>
              <input
                id="weeklyGoal"
                type="range"
                min="1"
                max="7"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Cooldown Period Slider */}
            <div className="space-y-2 border-t pt-4 border-border/30">
              <div className="flex justify-between items-center">
                <Label htmlFor="cooldownDays" className="text-sm font-medium flex items-center gap-1.5">
                  <Sliders className="size-4 text-primary/70 animate-pulse" />
                  <span>Cooldown Interval</span>
                </Label>
                <span className="text-xs font-bold py-0.5 px-2 bg-primary/10 text-primary rounded-full">
                  {cooldownDays} days repeat buffer
                </span>
              </div>
              <input
                id="cooldownDays"
                type="range"
                min="1"
                max="30"
                value={cooldownDays}
                onChange={(e) => setCooldownDays(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Completed questions will not be recommended in your Daily Plan for at least this period.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
