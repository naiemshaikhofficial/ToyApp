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
} from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const { stats, topProducts, topBrands, recentOrders } = await getDashboardAnalyticsAction()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Executive Control Center"
        subtitle="Real-Time Marketplace Performance, Gross Sales & Audio Developer Ecosystem"
      />

      <main className="p-8 space-y-8 flex-1">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Marketplace Volume */}
          <div className="epic-card p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Normalized GMV</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.normalizedGrossUsd?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                <span>USD: ${stats?.gmvUsd?.toFixed(2) || '0.00'}</span>
                <span>•</span>
                <span>INR: ₹{stats?.gmvInr?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Platform Revenue (30%) */}
          <div className="epic-card p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Platform Net (30%)</span>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                ${stats?.platformRevenueUsd?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                ProducerToy Net Retain Fee
              </p>
            </div>
          </div>

          {/* Active Brands */}
          <div className="epic-card p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Onboarded Brands</span>
              <Building2 className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                {stats?.totalBrands || 0}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                <Link href="/brands" className="text-zinc-200 hover:text-white underline font-mono flex items-center gap-1">
                  Manage Brands <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Live Catalog Products */}
          <div className="epic-card p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase font-semibold">Catalog Products</span>
              <Package className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                {stats?.activeProducts || 0}{' '}
                <span className="text-xs text-zinc-500 font-normal">/ {stats?.totalProducts || 0} total</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                <Link href="/products" className="text-zinc-200 hover:text-white underline font-mono flex items-center gap-1">
                  View Catalog <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-zinc-400" />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">Total Orders Processed</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{stats?.totalPurchases || 0} orders</div>
              </div>
            </div>
            <Link href="/orders" className="text-xs font-mono text-zinc-300 hover:text-white">View &rarr;</Link>
          </div>

          <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">Active Hardware Seats</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{stats?.activeDevices || 0} machines</div>
              </div>
            </div>
            <Link href="/licenses" className="text-xs font-mono text-zinc-300 hover:text-white">Audit &rarr;</Link>
          </div>

          <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">Creator Retain (70%)</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">
                  ${stats?.creatorPayoutsUsd?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
            <Link href="/payouts" className="text-xs font-mono text-zinc-300 hover:text-white">Settlements &rarr;</Link>
          </div>
        </div>

        {/* Split Section: Top Products & Top Brands */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="epic-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Top Performing Software & Packs</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Ranked by gross sales volume</p>
              </div>
              <Link href="/products" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1">
                Full List <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-[#181818] border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center font-mono font-bold text-xs text-zinc-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{p.brand}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">${p.revenueUsd.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{p.units} units</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">No sales recorded yet.</div>
              )}
            </div>
          </div>

          {/* Top Brands */}
          <div className="epic-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Top Audio Brands & Developers</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Highest grossing developer accounts</p>
              </div>
              <Link href="/brands" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1">
                All Brands <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topBrands && topBrands.length > 0 ? (
                topBrands.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-[#181818] border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center font-mono font-bold text-xs text-zinc-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{b.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{b.units} products sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">${b.revenueUsd.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Gross Volume</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">No brand sales data yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Orders Stream */}
        <div className="epic-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Recent Customer Orders</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Live transactions and software fulfillment</p>
            </div>
            <Link href="/orders" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
                <tr>
                  <th className="py-2.5 px-3">Order ID / Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product / Developer</th>
                  <th className="py-2.5 px-3">Activation Serial</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#181818]/60 transition">
                      <td className="py-3 px-3 font-mono">
                        <div className="text-white font-semibold">{ord.id.slice(0, 8)}...</div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(ord.purchased_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{ord.customer_name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{ord.customer_email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{ord.product_name}</div>
                        <div className="text-[11px] text-zinc-500">{ord.brand_name}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {ord.serial_key ? (
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">
                            {ord.serial_key}
                          </span>
                        ) : (
                          <span className="text-zinc-600">None required</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        {ord.currency === 'INR' ? '₹' : '$'}
                        {ord.amount.toFixed(2)} {ord.currency}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                      No customer orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
