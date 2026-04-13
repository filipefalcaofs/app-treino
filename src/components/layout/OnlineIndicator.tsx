import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function OnlineIndicator() {
  const { isOnline, pendingSync, isSyncing } = useOnlineStatus()

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error/20">
        <span className="material-symbols-outlined text-error text-sm">cloud_off</span>
        <span className="text-error text-xs font-semibold">Offline</span>
      </div>
    )
  }

  if (isSyncing || pendingSync > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary/15">
        <span className="material-symbols-outlined text-tertiary text-sm animate-spin">sync</span>
        <span className="text-tertiary text-xs font-semibold">
          Sincronizando{pendingSync > 0 ? ` (${pendingSync})` : '...'}
        </span>
      </div>
    )
  }

  return null
}
