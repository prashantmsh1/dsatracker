import { useAuth } from "@/context/AuthContext";
import { getPlaylists } from "@/lib/api/playlists";
import { useQuery } from "@tanstack/react-query";
import React from "react";
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

const PlaylistData = () => {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const playlistsQuery = useQuery({
// ... (omitting lines for brevity, will handle carefully)
        queryKey: ["playlists"],
        queryFn: getPlaylists,
        enabled: Boolean(user),
    });

    const handlePlaylistClick = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "playlist");
        params.set("id", id.toString());
        router.push(`?${params.toString()}`);
    };

    if (playlistsQuery.isLoading) {
        return (
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
        );
    }

    const playlists = playlistsQuery.data || [];

    if (playlists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-muted/20">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <FolderIcon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">No playlists found</h3>
                <p className="text-muted-foreground max-w-xs mt-1">
                    Create your first study playlist to keep your DSA journey organized.
                </p>
                <Button variant="outline" size="sm" className="mt-6 gap-2">
                    <PlusIcon className="size-4" />
                    Create Playlist
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
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
    );
};

export default PlaylistData;
