"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, Plus, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/dashboard/mode-toggle";

export type DashboardNavbarOption = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type DashboardNavbarProps = {
  title: string;
  options: DashboardNavbarOption[];
  onAddProblemClick?: () => void;
  onAddPlaylistClick?: () => void;
};

export function DashboardNavbar({
  title,
  options,
  onAddProblemClick,
  onAddPlaylistClick,
}: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="truncate text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {onAddPlaylistClick ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddPlaylistClick}
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Plus className="size-4" />
              <span className="hidden lg:inline">Create Playlist</span>
            </Button>
          ) : null}

          {onAddProblemClick ? (
            <Button
              variant="default"
              size="sm"
              onClick={onAddProblemClick}
              className="gap-2"
            >
              <Plus className="size-4" />
              <span className="hidden lg:inline">Add Problem</span>
            </Button>
          ) : null}

          {options.map((option) => (
            <Button
              key={option.label}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={option.href} />}
            >
              <option.icon />
              <span className="hidden md:inline">{option.label}</span>
            </Button>
          ))}

          <Button variant="outline" size="icon-sm" aria-label="Search">
            <Search />
          </Button>
          <ModeToggle />
          <Button variant="outline" size="icon-sm" aria-label="Notifications">
            <Bell />
          </Button>
          <Button variant="outline" size="sm">
            <UserCircle />
            Profile
          </Button>
        </div>
      </div>
    </header>
  );
}
