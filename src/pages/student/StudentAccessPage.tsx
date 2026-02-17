import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function StudentAccessPage() {
  const { token } = useParams<{ token: string }>()
  const loginByToken = useAuthStore((s) => s.loginByToken)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const success = loginByToken(token)
      if (success) {
        navigate('/student', { replace: true })
      }
    }
  }, [token, loginByToken, navigate])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-border p-8 text-center max-w-sm">
        <p className="text-lg font-bold text-primary mb-2">Загрузка...</p>
        <p className="text-sm text-text-secondary">
          {token ? 'Выполняем вход...' : 'Неверная ссылка'}
        </p>
      </div>
    </div>
  )
}
