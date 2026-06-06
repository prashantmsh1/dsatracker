import { useAuth } from "@/context/AuthContext";
import { getPlaylists } from "@/lib/api/playlists";
import { getCentralPlaylists } from "@/lib/api/central";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  FolderIcon, 
  ChevronRightIcon, 
  ClockIcon,
  PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type PlaylistDataProps = {
    onCreatePlaylistClick?: () => void;
}

const PlaylistData = ({ onCreatePlaylistClick }: PlaylistDataProps) => {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"my" | "central">("my");

    const playlistsQuery = useQuery({
        queryKey: ["playlists"],
        queryFn: getPlaylists,
        enabled: Boolean(user) && activeTab === "my",
    });

    const centralPlaylistsQuery = useQuery({
        queryKey: ["central-playlists"],
        queryFn: getCentralPlaylists,
        enabled: Boolean(user) && activeTab === "central",
    });

    const handlePlaylistClick = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "playlist");
        params.set("id", id.toString());
        if (activeTab === "central") {
            params.set("playlistType", "central");
        } else {
            params.delete("playlistType");
        }
        router.push(`?${params.toString()}`);
    };

    const isLoading = activeTab === "my" ? playlistsQuery.isLoading : centralPlaylistsQuery.isLoading;
    const playlists = activeTab === "my" ? (playlistsQuery.data || []) : (centralPlaylistsQuery.data || []);

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border mb-6 pb-[2px] gap-6">
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-1 py-2 text-sm font-semibold border-b-2 -mb-[4px] transition-colors cursor-pointer ${
                        activeTab === "my"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    My Playlists
                </button>
                <button
                    onClick={() => setActiveTab("central")}
                    className={`px-1 py-2 text-sm font-semibold border-b-2 -mb-[4px] transition-colors cursor-pointer ${
                        activeTab === "central"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Central Playlists
                </button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="gap-2">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-muted/20">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                        <FolderIcon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold">No playlists found</h3>
                    <p className="text-muted-foreground max-w-xs mt-1">
                        {activeTab === "central" 
                            ? "No central study playlists have been imported yet." 
                            : "Create your first study playlist to keep your DSA journey organized."}
                    </p>
                    {activeTab === "my" && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-6 gap-2"
                            onClick={onCreatePlaylistClick}
                        >
                            <PlusIcon className="size-4" />
                            Create Playlist
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    {activeTab === "my" && (
                        <Card 
                            className="group cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center p-6 min-h-[200px]"
                            onClick={onCreatePlaylistClick}
                        >
                            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <PlusIcon className="size-6" />
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Create Playlist</h3>
                            <p className="text-xs text-muted-foreground mt-1">Start a new collection</p>
                        </Card>
                    )}

                    {playlists.map((playlist) => (
                        <Card 
                            key={playlist.id} 
                            className="group cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 hover:bg-card"
                            onClick={() => handlePlaylistClick(playlist.id)}
                        >
                            <CardHeader className="pb-3 px-5 pt-5">
                                <div className="flex items-start justify-between">
                                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <FolderIcon className="size-5" />
                                    </div>
                                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRightIcon className="size-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-lg font-semibold mt-4 group-hover:text-primary transition-colors">
                                    {playlist.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                                    <ClockIcon className="size-3" />
                                    Created {new Date(playlist.createdAt as string).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="px-5 pb-5 pt-0 mt-4">
                                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/40 border border-border/40 group-hover:border-primary/10 transition-colors">
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="size-5 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold">
                                                {i === 3 ? '+' : ''}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs font-medium">
                                        <span className="text-primary">{playlist.problemCount}</span>
                                        <span className="text-muted-foreground ml-1">problems</span>
                                    </div>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">View Playlist</span>
                                <ChevronRightIcon className="size-3 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaylistData;
