import { useWalletStore } from "@/lib/stores/wallet-store"
import { useAuthStore } from "@/lib/stores/auth-store"

export function WalletCard() {
  const { user } = useAuthStore()
  const { balanceUSD, pendingAmount } = useWalletStore()

  const balanceGHS = balanceUSD * 15.5

  return (
    <div className="bg-gradient-to-br from-[#00C6A7] to-[#0087FF] rounded-2xl p-6">
      <p className="text-white/70 text-sm uppercase tracking-wider">
        Available Balance
      </p>
      <p className="text-white text-4xl font-bold font-mono mt-1">
        GHS {balanceGHS.toFixed(2)}
      </p>
      <p className="text-white/60 text-sm mt-1">
        ≈ USD {balanceUSD.toFixed(2)}
      </p>
    </div>
  )
}
