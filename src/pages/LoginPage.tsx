import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { GraduationCap, LogIn } from 'lucide-react'

const quickLogins = [
  { label: 'Учитель (Адильби)', email: 'adilbi@olympiad.kz', password: 'adilbi123', color: '#1B3A5C' },
  { label: 'Родитель (Мама)', email: 'mama@olympiad.kz', password: 'mama123', color: '#2A9D8F' },
  { label: 'Маржан (ученик)', email: 'marzhan@olympiad.kz', password: 'marzhan123', color: '#7B2D8E' },
  { label: 'Батырхан (ученик)', email: 'batyrkhan@olympiad.kz', password: 'batyrkhan123', color: '#2E5D8A' },
]

export default function LoginPage() {
  const { login, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (!ok) setError('Неверный email или пароль')
  }

  const handleQuickLogin = async (em: string, pw: string) => {
    setEmail(em)
    setPassword(pw)
    setError('')
    await login(em, pw)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Олимпиадный Трекер</h1>
          <p className="text-text-secondary mt-1">Подготовка к FEMO</p>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
              placeholder="email@olympiad.kz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        {/* Разделитель */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-text-secondary">быстрый вход</span>
          </div>
        </div>

        {/* Быстрый вход */}
        <div className="grid grid-cols-2 gap-2">
          {quickLogins.map((ql) => (
            <button
              key={ql.email}
              onClick={() => handleQuickLogin(ql.email, ql.password)}
              className="flex items-center gap-2 p-3 border-2 rounded-xl transition hover:shadow-md text-left"
              style={{ borderColor: `${ql.color}30`, backgroundColor: `${ql.color}05` }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: ql.color }}
              >
                {ql.label[0]}
              </div>
              <span className="text-xs font-medium leading-tight" style={{ color: ql.color }}>
                {ql.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
