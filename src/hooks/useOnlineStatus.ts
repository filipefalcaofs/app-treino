import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getPendingCount, processQueue } from '../lib/sync'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot)
  const [pendingSync, setPendingSync] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const refreshPending = useCallback(async () => {
    const count = await getPendingCount()
    setPendingSync(count)
  }, [])

  useEffect(() => {
    refreshPending()
    const interval = setInterval(refreshPending, 5000)
    return () => clearInterval(interval)
  }, [refreshPending])

  useEffect(() => {
    if (!isOnline || pendingSync === 0) return

    let cancelled = false

    async function sync() {
      setIsSyncing(true)
      try {
        await processQueue()
        if (!cancelled) {
          const count = await getPendingCount()
          setPendingSync(count)
        }
      } finally {
        if (!cancelled) setIsSyncing(false)
      }
    }

    sync()
    return () => { cancelled = true }
  }, [isOnline, pendingSync])

  return { isOnline, pendingSync, isSyncing }
}
