import { create } from "zustand";

interface WalletStore {
  balanceUSD: number;
  pendingAmount: number;
  setBalance: (usd: number) => void;
  setPending: (usd: number) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  // Initialize with some default placeholder values for now
  balanceUSD: 0,
  pendingAmount: 0,
  
  setBalance: (usd) => set({ balanceUSD: usd }),
  setPending: (usd) => set({ pendingAmount: usd }),
}));
