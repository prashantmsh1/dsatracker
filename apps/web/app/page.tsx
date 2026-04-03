import { CheckCircle, Circle, ExternalLink, Plus } from "lucide-react";

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-24 bg-zinc-950 text-zinc-100">
            <div className="z-10 max-w-5xl w-full flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold tracking-tight">DSA Tracker</h1>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Plus size={20} />
                        Add Problem
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        </main>
    );
}
