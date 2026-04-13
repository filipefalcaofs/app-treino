import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { user, loading, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="h-dvh bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: authError } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (authError) {
      setError(authError.message)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-background text-on-surface font-body h-dvh flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-secondary-container/20 blur-[100px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-md mx-auto px-6 py-safe">
        <header className="mb-8 md:mb-12 text-left">
          <div className="flex items-center gap-2 mb-3 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-container flex items-center justify-center rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="material-symbols-outlined text-on-primary-container filled text-xl md:text-2xl">
                bolt
              </span>
            </div>
            <h1 className="font-headline font-black italic text-3xl md:text-4xl tracking-tighter text-primary-container">
              GAINLOG
            </h1>
          </div>
          <p className="font-headline text-on-surface text-lg md:text-xl font-bold leading-tight">
            {isSignUp ? 'Crie sua conta e comece a evoluir.' : 'Acesse sua conta para continuar evoluindo.'}
          </p>
          <p className="text-on-surface-variant text-sm mt-1.5 font-medium">
            {isSignUp ? 'Preencha seus dados para começar.' : 'Insira suas credenciais de performance.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 group">
            <label
              htmlFor="email"
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors"
            >
              E-mail
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                required
                autoComplete="email"
                className="w-full h-12 md:h-14 bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary text-on-surface px-4 pr-12 transition-all outline-none placeholder:text-outline font-medium text-base"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <span className="material-symbols-outlined text-xl">alternate_email</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 group">
            <label
              htmlFor="password"
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full h-12 md:h-14 bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary text-on-surface px-4 pr-12 transition-all outline-none placeholder:text-outline font-medium text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-2.5">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="kinetic-gradient w-full h-12 md:h-14 rounded-xl mt-2 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-headline font-black text-on-primary-fixed text-base md:text-lg tracking-wider">
                  {isSignUp ? 'CRIAR CONTA' : 'ENTRAR'}
                </span>
                <span className="material-symbols-outlined text-on-primary-fixed font-bold group-hover:translate-x-1 transition-transform text-xl">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <p className="text-on-surface-variant text-sm font-medium text-center mt-8 md:mt-12">
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="text-primary font-bold hover:underline underline-offset-4 ml-1"
          >
            {isSignUp ? 'Entrar' : 'Criar nova conta'}
          </button>
        </p>
      </main>

      <div className="hidden md:fixed md:block top-12 left-12 w-32 h-32 border-l border-t border-outline-variant/20 pointer-events-none" />
      <div className="hidden md:fixed md:block bottom-12 right-12 w-32 h-32 border-r border-b border-outline-variant/20 pointer-events-none" />
    </div>
  )
}
