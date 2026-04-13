import { create } from 'zustand'
import type { Cycle } from '../types'

interface CycleState {
  activeCycle: Cycle | null
  setActiveCycle: (cycle: Cycle | null) => void
  clearActiveCycle: () => void
}

export const useCycleStore = create<CycleState>((set) => ({
  activeCycle: null,
  setActiveCycle: (cycle) => set({ activeCycle: cycle }),
  clearActiveCycle: () => set({ activeCycle: null }),
}))
