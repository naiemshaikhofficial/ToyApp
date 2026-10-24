import { AdminHeader } from "@/components/layout/AdminHeader";
import { getDashboardAnalyticsAction } from "@/actions/analyticsActions";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  Laptop,
  Receipt,
  LifeBuoy,
} from "lucide-react";
import ActivityClientTabs from "./ActivityClientTabs";

export const revalidate = 0;

export default async function ActivityAnalyticsPage() {
  const result = await getDashboardAnalyticsAction();
  const rawActivity = result.data?.recentActivity || [];

  return (
    <div className="flex-1 flex flex-col font-sans">
      <AdminHeader
        title="Ecosystem Activity & Audit Analytics"
        subtitle="Dedicated multi-channel event telemetry segregated by Staff, Admin, and Customer actions"
      />

      <main className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Command Overview</span>
          </Link>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-zinc-400">
            Real-time Database Audit Trail
          </span>
        </div>

        {/* Client-Side Interactive Tabbed Activity Feed */}
        <ActivityClientTabs initialActivity={rawActivity} />
      </main>
    </div>
  );
}
