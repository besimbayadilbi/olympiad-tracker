import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { GraduationCap, LogOut } from 'lucide-react'

export default function ParentLayout() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Олимпиадный Трекер</h1>
            <p className="text-xs text-white/60">Кабинет родителя</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80 hidden sm:inline">{user?.name}</span>
          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
