"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import {
  Home,
  FolderOpen,
  Code2,
  Settings,
  Plus,
  ExternalLink,
  Clock,
  Calendar,
  Search,
  X,
  ChevronRight,
  Target,
} from "lucide-react";

type Difficulty = "Easy" | "Medium" | "Hard";

type MockQuestion = {
  id: number;
  title: string;
  url: string;
  difficulty: Difficulty;
  playlists: string[];
  lastShown: string;
  notes: string;
};

type DailyChallenge = {
  title: string;
  difficulty: Difficulty;
  url: string;
  reason: string;
  playlist: string;
};

// --- MOCK DATA ---
const MOCK_PLAYLISTS = [
  { id: 1, name: "Blind 75", count: 75 },
  { id: 2, name: "Dynamic Programming", count: 12 },
  { id: 3, name: "Google Interviews", count: 24 },
];

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    title: "Two Sum",
    url: "#",
    difficulty: "Easy",
    playlists: ["Blind 75"],
    lastShown: "2 days ago",
    notes: "Use a hash map to store complements.",
  },
  {
    id: 2,
    title: "LRU Cache",
    url: "#",
    difficulty: "Medium",
    playlists: ["Blind 75", "Google Interviews"],
    lastShown: "14 days ago",
    notes: "Double linked list + Hash map is the key.",
  },
  {
    id: 3,
    title: "Trapping Rain Water",
    url: "#",
    difficulty: "Hard",
    playlists: ["Google Interviews"],
    lastShown: "Never",
    notes: "Two pointer approach is O(1) space.",
  },
  {
    id: 4,
    title: "Climbing Stairs",
    url: "#",
    difficulty: "Easy",
    playlists: ["Dynamic Programming"],
    lastShown: "5 days ago",
    notes: "Basically Fibonacci.",
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    url: "#",
    difficulty: "Medium",
    playlists: ["Dynamic Programming"],
    lastShown: "1 day ago",
    notes: "Expand around center.",
  },
];

const DAILY_CHALLENGE: DailyChallenge = {
  title: "LRU Cache",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/lru-cache/",
  reason: "Has not been shown in 14 days",
  playlist: "Blind 75",
};

// --- COMPONENTS ---

type BadgeProps = {
  children: ReactNode;
  difficulty?: Difficulty;
};

const Badge = ({ children, difficulty }: BadgeProps) => {
  const colors = {
    Easy: "bg-blue-50 text-blue-700 border-blue-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-red-50 text-red-700 border-red-200",
    Default: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const colorClass = difficulty ? colors[difficulty] : colors.Default;

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Code2 className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">AlgoTrack</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          <NavItem
            icon={<Home size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<ListIcon w={20} />}
            label="Problems"
            active={activeTab === "problems"}
            onClick={() => setActiveTab("problems")}
          />
          <NavItem
            icon={<FolderOpen size={20} />}
            label="Playlists"
            active={activeTab === "playlists"}
            onClick={() => setActiveTab("playlists")}
          />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {activeTab}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "problems" && <ProblemsView />}
            {activeTab === "playlists" && <PlaylistsView />}
            {activeTab === "settings" && <SettingsView />}
          </div>
        </div>
      </main>

      {/* Add Problem Modal */}
      {isModalOpen && <AddProblemModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView() {
  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Solved"
          value="142"
          icon={<Target className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Current Streak"
          value="12 Days"
          icon={<Calendar className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Cooldown Setting"
          value="14 Days"
          icon={<Clock className="w-5 h-5 text-slate-500" />}
        />
      </div>

      {/* Today's Challenge */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Today&apos;s Challenge
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  {DAILY_CHALLENGE.title}
                </h3>
                <Badge difficulty={DAILY_CHALLENGE.difficulty}>
                  {DAILY_CHALLENGE.difficulty}
                </Badge>
              </div>
              <p className="text-slate-500 flex items-center text-sm">
                <FolderOpen className="w-4 h-4 mr-1.5" /> From{" "}
                {DAILY_CHALLENGE.playlist} • {DAILY_CHALLENGE.reason}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors">
                Skip for today
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center shadow-sm">
                Solve on LeetCode <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Additions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Recently Added
          </h2>
          <button className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Problem</th>
                <th className="px-6 py-4 font-medium">Playlists</th>
                <th className="px-6 py-4 font-medium">Last Shown</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_QUESTIONS.slice(0, 3).map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="font-medium text-slate-900 mr-3">
                        {q.title}
                      </span>
                      <Badge difficulty={q.difficulty}>{q.difficulty}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex gap-1.5 flex-wrap">
                      {q.playlists.map((p) => (
                        <span
                          key={p}
                          className="bg-slate-100 px-2 py-1 rounded text-xs"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{q.lastShown}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 p-1">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ProblemsView() {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems or notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <select className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Playlists</option>
          <option>Blind 75</option>
          <option>Dynamic Programming</option>
        </select>
      </div>

      {/* Problem Cards */}
      <div className="grid grid-cols-1 gap-4">
        {MOCK_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mr-3 inline-block">
                  {q.title}
                </h3>
                <Badge difficulty={q.difficulty}>{q.difficulty}</Badge>
              </div>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            {q.notes && (
              <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong className="text-slate-700">Notes:</strong> {q.notes}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {q.playlists.join(", ")}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last seen: {q.lastShown}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaylistsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_PLAYLISTS.map((p) => (
        <div
          key={p.id}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h3>
          <p className="text-slate-500 text-sm">{p.count} problems saved</p>
        </div>
      ))}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors cursor-pointer min-h-[160px]">
        <Plus className="w-8 h-8 mb-2" />
        <span className="font-medium">Create New Playlist</span>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        Algorithm Settings
      </h2>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cooldown Period (Days)
          </label>
          <p className="text-sm text-slate-500 mb-4">
            A problem will not be recommended again until this many days have
            passed.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="30"
              defaultValue="14"
              className="w-full accent-blue-600"
            />
            <span className="bg-slate-100 text-slate-800 font-bold px-4 py-2 rounded-lg min-w-[4rem] text-center">
              14
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>1 Day</span>
            <span>30 Days</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// --- UTILS & SMALL COMPONENTS ---

type NavItemProps = {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2.5 mb-1 rounded-xl font-medium transition-all duration-200 ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      </div>
    </div>
  );
}

function ListIcon({ w }: { w: number }) {
  return (
    <svg
      width={w}
      height={w}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

function AddProblemModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Add New Problem</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              LeetCode URL
            </label>
            <input
              type="text"
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Playlists
            </label>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
              {MOCK_PLAYLISTS.map((p, idx) => (
                <label
                  key={p.id}
                  className={`flex items-center px-4 py-3 cursor-pointer hover:bg-slate-100 ${idx !== 0 ? "border-t border-slate-200" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What's the trick to solving this?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900 resize-none"
            ></textarea>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Save Problem
          </button>
        </div>
      </div>
    </div>
  );
}
