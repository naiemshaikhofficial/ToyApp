"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Users,
  Clock,
  Filter,
  CheckCircle,
  Laptop,
  Receipt,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: "ORDER" | "TICKET" | "ACTIVATION" | "ARTICLE" | "CREATOR";
  title: string;
  subtitle: string;
  timestamp: string;
  badge: string;
  href: string;
}

export interface ActivityClientTabsProps {
  initialActivity: ActivityItem[];
}

type ActivityCategory = "all" | "staff" | "admin" | "users";

export default function ActivityClientTabs({ initialActivity }: ActivityClientTabsProps) {
  const [activeTab, setActiveTab] = useState<ActivityCategory>("all");
  const [search, setSearch] = useState("");

  const filteredActivity = useMemo(() => {
    return initialActivity.filter((item) => {
      // Category match
      let matchesCategory = true;
      if (activeTab === "staff") {
        matchesCategory = item.type === "ARTICLE" || item.badge.includes("TURSO") || item.badge.includes("BLOG");
      } else if (activeTab === "admin") {
        matchesCategory = item.type === "CREATOR" || item.badge.includes("TICKET") || item.badge.includes("DEV");
      } else if (activeTab === "users") {
        matchesCategory = item.type === "ORDER" || item.type === "ACTIVATION" || item.badge.includes("DRM") || item.badge.includes("ORDER");
      }

      // Search match
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [initialActivity, activeTab, search]);

  const counts = useMemo(() => {
    return {
      all: initialActivity.length,
      staff: initialActivity.filter((i) => i.type === "ARTICLE" || i.badge.includes("TURSO") || i.badge.includes("BLOG")).length,
      admin: initialActivity.filter((i) => i.type === "CREATOR" || i.badge.includes("TICKET") || i.badge.includes("DEV")).length,
      users: initialActivity.filter((i) => i.type === "ORDER" || i.type === "ACTIVATION" || i.badge.includes("DRM") || i.badge.includes("ORDER")).length,
    };
  }, [initialActivity]);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="epic-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[#242424] rounded-lg">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono font-medium transition",
              activeTab === "all"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            All Events ({counts.all})
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono font-medium transition flex items-center gap-1.5",
              activeTab === "staff"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Activity ({counts.staff})</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono font-medium transition flex items-center gap-1.5",
              activeTab === "admin"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Operations ({counts.admin})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono font-medium transition flex items-center gap-1.5",
              activeTab === "users"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Activity ({counts.users})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs font-mono bg-[#141414] border border-[#242424] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition"
          />
        </div>
      </div>

      {/* Segregated Activity Table */}
      <div className="epic-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {activeTab === "all" && "All Real-Time Platform Logs"}
              {activeTab === "staff" && "Editorial, Deals & Catalog Logs (Staff)"}
              {activeTab === "admin" && "Escalations, Partner Brands & Security (Admin)"}
              {activeTab === "users" && "Verified Purchases, DRM Activations & Support (Customer)"}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Showing {filteredActivity.length} verified records
          </span>
        </div>

        <div className="divide-y divide-[#202020] text-xs">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#181818]/60 px-3 rounded-lg transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2e2e2e] text-zinc-300 uppercase shrink-0">
                    {act.badge}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate text-sm">{act.title}</div>
                    <div className="text-xs text-zinc-400 font-mono truncate mt-0.5">{act.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-mono text-zinc-400 block">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Link
                    href={act.href}
                    className="p-1.5 rounded-md bg-[#1f1f1f] text-zinc-400 hover:text-white transition"
                    title="Inspect Target Record"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No matching activity records found for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
