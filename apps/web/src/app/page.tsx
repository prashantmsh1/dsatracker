import { db, problems } from "@repo/db";
import { CheckCircle, Circle, ExternalLink, Plus } from "lucide-react";

export default async function Home() {
  let allProblems = [];
  try {
    allProblems = await db.select().from(problems);
  } catch (error) {
    console.error("Database connection failed or table does not exist yet.", error);
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProblems.length > 0 ? (
            allProblems.map((problem) => (
              <div 
                key={problem.id} 
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{problem.title}</h3>
                  {problem.completed ? (
                    <CheckCircle className="text-green-500" size={24} />
                  ) : (
                    <Circle className="text-zinc-600" size={24} />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                    {problem.category}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 line-clamp-2">
                  {problem.notes || "No notes provided."}
                </p>

                <div className="mt-auto pt-4 border-t border-zinc-800">
                  <a 
                    href={problem.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    View Problem <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500">No problems tracked yet. Try adding one or running your migrations.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
