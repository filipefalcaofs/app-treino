import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallPrompt() {
  const { showPrompt, isIOSDevice, install, dismiss } = useInstallPrompt()

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 mb-6 rounded-2xl bg-surface-container-high border border-outline-variant/20 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header com icone */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-14 h-14 shrink-0 kinetic-gradient rounded-xl flex items-center justify-center rotate-3">
            <span
              className="material-symbols-outlined text-on-primary-fixed text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline font-black text-lg text-on-surface">
              Instalar GainLog
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              Adicione o app na sua tela inicial para acesso rapido e experiencia completa offline.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {isIOSDevice ? (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-surface-container border border-outline-variant/10">
              <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-semibold">1.</span>
                  <span>Toque em</span>
                  <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    ios_share
                  </span>
                  <span>no menu do Safari</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-semibold">2.</span>
                  <span>Selecione</span>
                  <span className="font-semibold text-on-surface">"Tela de Inicio"</span>
                  <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_box
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Botoes */}
        <div className="px-6 pb-6 pt-3 flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 h-12 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface-variant font-semibold text-sm hover:bg-surface-container-highest transition-colors"
          >
            Agora nao
          </button>
          {!isIOSDevice && (
            <button
              onClick={install}
              className="flex-1 h-12 rounded-xl kinetic-gradient font-headline font-black text-on-primary-fixed text-sm tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                download
              </span>
              INSTALAR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
