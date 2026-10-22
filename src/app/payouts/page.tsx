import { getAdminPayoutsAction, getSettlementOverviewAction } from '@/actions/payoutActions'
import { PayoutsClient } from './PayoutsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function PayoutsPage() {
  const [payoutsRes, settlementRes] = await Promise.all([
    getAdminPayoutsAction(),
    getSettlementOverviewAction(),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Creator Payouts & Settlements"
        subtitle="70/30 Revenue Split Accounting, Currency Normalization, Bank UTR Settlements & Payout Liabilities"
      />
      <main className="p-8 flex-1">
        <PayoutsClient
          initialPayouts={payoutsRes.payouts || []}
          settlementData={settlementRes.data}
        />
      </main>
    </div>
  )
}
