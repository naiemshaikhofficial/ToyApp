import { AdminHeader } from '@/components/layout/AdminHeader'
import { getDashboardAnalyticsAction } from '@/actions/analyticsActions'
import Link from 'next/link'
import {
  TrendingUp,
  DollarSign,
  Building2,
  Package,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  LifeBuoy,
  Users,
  Newspaper,
  BookOpen,
  Code2,
  Flame,
  ArrowDownRight,
  Activity,
  Laptop,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { AreaSparkline, LineSparkline, BarSparkline } from '@/components/ui/charts/Sparklines'
import { LiveLineChart } from '@/components/ui/charts/LiveLineChart'
import { ChoroplethMap } from '@/components/ui/charts/ChoroplethMap'
import { EcosystemDonutLinkedLegend } from '@/components/ui/charts/EcosystemDonutLinkedLegend'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const result = await getDashboardAnalyticsAction()
  const data = result.data

  const stats = data?.stats
  const topProducts = data?.topProducts || []
  const topBrands = data?.topBrands || []
  const recentOrders = data?.recentOrders || []
  const recentActivity = data?.recentActivity || []
  const timelines = data?.timelines
  const countryTraffic = data?.countryTraffic || []

  return (
    <div className="flex-1 flex flex-col font-sans">
      <AdminHeader
        title="Executive Control Center"
        subtitle="Unified Command Mother-Ship for ProducerToy Storefront & Toy Creator Developer Portal"
      />

      <main className="p-8 space-y-8 flex-1 max-w-7xl mx-auto w-full">

        {/* 2. Executive 70/30 Financial Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="epic-card p-5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Total Sales</span>
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.normalizedGrossUsd?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                <span>USD: ${stats?.gmvUsd?.toFixed(2) || '0.00'}</span>
                <span>•</span>
                <span>INR: ₹{stats?.gmvInr?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="py-1">
              <AreaSparkline
                data={timelines?.gmv && timelines.gmv.length > 1 ? timelines.gmv : [0, 0, 0, 0, 0, 0, 0]}
                height={32}
              />
            </div>
            <div className="pt-2 border-t border-[#242424] text-[10px] text-zinc-500 font-mono">
              Total revenue from all store orders
            </div>
          </div>

          {/* Platform Revenue (30%) */}
          <div className="epic-card p-5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Platform Profit (30%)</span>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.platformRevenueUsd?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                Our 30% platform share
              </p>
            </div>
            <div className="py-1">
              <LineSparkline
                data={timelines?.platformRevenue && timelines.platformRevenue.length > 1 ? timelines.platformRevenue : [0, 0, 0, 0, 0, 0, 0]}
                height={32}
                showDot
              />
            </div>
            <div className="pt-2 border-t border-[#242424] text-[10px] text-zinc-500 font-mono">
              Calculated automatically on every sale
            </div>
          </div>

          {/* Creator Earnings Pool (70%) */}
          <div className="epic-card p-5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Creator Payouts (70%)</span>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.creatorPayoutsUsd?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                Earnings reserved for audio creators
              </p>
            </div>
            <div className="py-1">
              <AreaSparkline
                data={timelines?.creatorPayouts && timelines.creatorPayouts.length > 1 ? timelines.creatorPayouts : [0, 0, 0, 0, 0, 0, 0]}
                height={32}
              />
            </div>
            <div className="pt-2 border-t border-[#242424] text-[10px] text-zinc-500 font-mono">
              Ready for creator bank & UPI payouts
            </div>
          </div>

          {/* Average Order Value & Total Orders */}
          <div className="epic-card p-5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Average Order Value</span>
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.averageOrderValueUsd?.toFixed(2) || '0.00'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                From {stats?.totalPurchases || 0} completed orders
              </div>
            </div>
            <div className="py-1">
              <BarSparkline
                data={timelines?.aov && timelines.aov.length > 1 ? timelines.aov : [0, 0, 0, 0, 0, 0, 0]}
                height={32}
              />
            </div>
            <div className="pt-2 border-t border-[#242424] text-[10px] text-zinc-500 font-mono">
              Average amount spent per purchase
            </div>
          </div>
        </div>

        {/* 2.5 Real-Time Sales & Global Visitors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <LiveLineChart
              title="Sales Over Time"
              data={timelines?.gmv && timelines.gmv.length > 1 ? timelines.gmv : [0, 0, 0, 0, 0, 0, 0]}
              days={timelines?.days || []}
              currentValue={stats?.normalizedGrossUsd || 0}
              streaming={true}
              height={220}
            />
          </div>
          <div className="lg:col-span-6">
            <ChoroplethMap data={countryTraffic} />
          </div>
        </div>

        {/* 2.6 Ecosystem Distribution with Bklit UI Linked Legend */}
        <EcosystemDonutLinkedLegend
          title="Platform Distribution & Ecosystem Share"
          subtitle="Real-time accounts, audio brands, and hardware activations with linked interactive breakdown"
          defaultLabel="Total Accounts"
          data={[
            {
              label: 'Registered Customers',
              value: stats?.totalCustomers || 0,
              maxValue: Math.max(10, (stats?.totalCustomers || 0) + (stats?.totalBrands || 0)),
              color: '#ffffff',
              subtitle: 'Active storefront accounts',
            },
            {
              label: 'Active Devices',
              value: stats?.activeDevices || 0,
              maxValue: Math.max(10, (stats?.totalCustomers || 0) + (stats?.totalBrands || 0)),
              color: '#e4e4e7',
              subtitle: 'Workstations with plugin seats',
            },
            {
              label: 'Audio Brands',
              value: stats?.totalBrands || 0,
              maxValue: Math.max(10, (stats?.totalCustomers || 0) + (stats?.totalBrands || 0)),
              color: '#a1a1aa',
              subtitle: 'Partnered creator brands',
            },
            {
              label: 'Registered Developers',
              value: stats?.totalBrandMembers || 0,
              maxValue: Math.max(10, (stats?.totalCustomers || 0) + (stats?.totalBrands || 0)),
              color: '#71717a',
              subtitle: 'Brand team members',
            },
            {
              label: 'Completed Orders',
              value: stats?.totalPurchases || 0,
              maxValue: Math.max(10, (stats?.totalCustomers || 0) + (stats?.totalBrands || 0)),
              color: '#52525b',
              subtitle: 'Fulfillment checkouts',
            },
          ]}
        />

        {/* 3. Customer Support & Inquiries Center */}
        <div className="p-5 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-white" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Customer Support & Inquiries
              </h2>
            </div>
            <Link
              href="/support"
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Open Support Desk <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <Link
              href="/support"
              className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] hover:border-zinc-500 transition group flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Urgent Tickets</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-white" />
                  <span>{stats?.escalatedToTeamTickets || 0}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Needs Immediate Attention</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
            </Link>

            <Link
              href="/support"
              className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] hover:border-zinc-500 transition group flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Sent to Developers</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                  <span>{stats?.escalatedToDevTickets || 0}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Plugin & Tool Questions</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
            </Link>

            <Link
              href="/support"
              className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] hover:border-zinc-500 transition group flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Waiting for Reply</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-white" />
                  <span>{stats?.openTickets || 0}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Customer Questions</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
            </Link>

            <Link
              href="/payouts"
              className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] hover:border-zinc-500 transition group flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Creator Payouts</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Ready</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Calculated & Ready</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
            </Link>
          </div>
        </div>

        {/* 4. Dual-Ecosystem Activity Gauges (Creator Portal vs Storefront) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Creator Portal Gauge */}
          <div className="epic-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-white" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Creator Portal (Audio Developers)
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    creators.producertoy.com
                  </div>
                </div>
              </div>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                Launch Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Audio Brands</div>
                <div className="text-xl font-bold text-white mt-1">{stats?.totalBrands || 0}</div>
                <Link href="/brands" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  View Brands &rarr;
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Registered Developers</div>
                <div className="text-xl font-bold text-white mt-1">{stats?.totalBrandMembers || 0}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Developer Accounts</div>
              </div>

              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Active Devices</div>
                <div className="text-xl font-bold text-white mt-1">{stats?.activeDevices || 0}</div>
                <Link href="/licenses" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  View Devices &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Storefront Gauge */}
          <div className="epic-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-white" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Online Store (Storefront)
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    producertoy.com
                  </div>
                </div>
              </div>
              <a
                href="https://producertoy.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                Open Store <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Products for Sale</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats?.activeProducts || 0}{' '}
                  <span className="text-xs text-zinc-500 font-normal">/ {stats?.totalProducts || 0}</span>
                </div>
                <Link href="/products" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  Catalog &rarr;
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Registered Customers</div>
                <div className="text-xl font-bold text-white mt-1">{stats?.totalCustomers || 0}</div>
                <Link href="/users" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  Directory &rarr;
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Audio Deals & News</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats?.totalTursoNews || 160}+
                </div>
                <Link href="/news" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  Browse Deals &rarr;
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                <div className="text-[10px] text-zinc-500 uppercase">Articles & Guides</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats?.publishedArticles || 0}{' '}
                  <span className="text-xs text-zinc-500 font-normal">/ {stats?.totalArticles || 0}</span>
                </div>
                <Link href="/blogs" className="text-[10px] text-zinc-400 hover:text-white underline mt-0.5 block">
                  Read Articles &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Top Audio Developers & Bestselling Software */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Brands / Developers */}
          <div className="epic-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Top Audio Developers & Brands
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Ranked by gross sales volume with 70/30 royalty split
                </p>
              </div>
              <Link href="/brands" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1">
                All Brands <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topBrands && topBrands.length > 0 ? (
                topBrands.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded bg-[#242424] border border-[#333] flex items-center justify-center font-mono font-bold text-xs text-white">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{b.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {b.units} products sold • 70% Creator: ${b.creatorShareUsd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">${b.revenueUsd.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">Gross Volume</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No developer sales recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Top Software Instruments & Sound Packs */}
          <div className="epic-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Bestselling Software & Sound Packs
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Top generating VST plugins, libraries & audio tools
                </p>
              </div>
              <Link href="/products" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1">
                Full Catalog <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded bg-[#242424] border border-[#333] flex items-center justify-center font-mono font-bold text-xs text-white">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{p.brand}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">${p.revenueUsd.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">{p.units} units sold</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No product transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Multi-Channel Unified Ecosystem Activity Feed */}
        <div className="epic-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Live Multi-Channel Ecosystem Stream
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Real-time events across Customer Orders, Developer Inquiries, DRM Machine Seats & Editorial Deals
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#202020] border border-[#333] text-zinc-300 rounded">
              Live Stream
            </span>
          </div>

          <div className="divide-y divide-[#242424] text-xs">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#181818]/70 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#202020] border border-[#333] text-zinc-300 uppercase shrink-0">
                      {act.badge}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{act.title}</div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate">{act.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link
                      href={act.href}
                      className="p-1 text-zinc-400 hover:text-white transition"
                      title="Inspect Record"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* 7. 1-Click Executive Launchpad */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Executive Module Launchpad
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
            <Link
              href="/brands"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Building2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Brands</div>
                <div className="text-[10px] text-zinc-500">304 Partners</div>
              </div>
            </Link>

            <Link
              href="/products"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Package className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Products</div>
                <div className="text-[10px] text-zinc-500">Catalog Engine</div>
              </div>
            </Link>

            <Link
              href="/orders"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Receipt className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Sales & Orders</div>
                <div className="text-[10px] text-zinc-500">Fulfillment</div>
              </div>
            </Link>

            <Link
              href="/payouts"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Payouts</div>
                <div className="text-[10px] text-zinc-500">70/30 Split</div>
              </div>
            </Link>

            <Link
              href="/licenses"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">DRM Licenses</div>
                <div className="text-[10px] text-zinc-500">Hardware Seats</div>
              </div>
            </Link>

            <Link
              href="/users"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Users className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Customers</div>
                <div className="text-[10px] text-zinc-500">Profiles & Data</div>
              </div>
            </Link>

            <Link
              href="/support"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <LifeBuoy className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Support Desk</div>
                <div className="text-[10px] text-zinc-500">Escalations</div>
              </div>
            </Link>

            <Link
              href="/news"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Newspaper className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Deals & News</div>
                <div className="text-[10px] text-zinc-500">160+ Active Deals</div>
              </div>
            </Link>

            <Link
              href="/blogs"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Articles & Guides</div>
                <div className="text-[10px] text-zinc-500">Tutorials & Articles</div>
              </div>
            </Link>

            <Link
              href="/invoices"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Receipt className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Tax Invoices</div>
                <div className="text-[10px] text-zinc-500">GST / Records</div>
              </div>
            </Link>

            <Link
              href="/staff"
              className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-white transition flex flex-col justify-between group"
            >
              <Users className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
              <div className="mt-3">
                <div className="font-bold text-white">Staff Roles</div>
                <div className="text-[10px] text-zinc-500">RBAC Controls</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
