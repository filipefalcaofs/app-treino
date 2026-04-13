import type { Profile } from '../../types'

interface ProfileCardProps {
  profile: Profile | null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const name = profile?.name?.toUpperCase() ?? 'USUARIO'
  const goal = profile?.goal ?? '--'
  const since = profile?.created_at ? formatDate(profile.created_at) : '--'

  return (
    <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-fixed/10 transition-all" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary-fixed p-1">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                  person
                </span>
              </div>
            )}
          </div>
          {profile?.avatar_url && (
            <div className="absolute bottom-0 right-0 bg-primary-fixed text-on-primary-fixed w-8 h-8 rounded-full flex items-center justify-center border-4 border-surface-container-low">
              <span className="material-symbols-outlined text-sm">verified</span>
            </div>
          )}
        </div>

        <div className="flex-grow text-center sm:text-left">
          <h2 className="text-3xl font-black font-headline text-on-surface mb-1">
            {name}
          </h2>
          <span className="inline-block px-3 py-1 bg-surface-container-highest text-primary font-bold text-xs rounded-full mb-6">
            ATLETA
          </span>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">
                Objetivo
              </p>
              <p className="text-on-surface font-black text-xl">{goal}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">
                Ativo desde
              </p>
              <p className="text-on-surface font-black text-xl">{since}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
