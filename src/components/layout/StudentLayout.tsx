import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { GraduationCap, LogOut, Star } from 'lucide-react'

export default function StudentLayout() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const studentId = useAuthStore((s) => s.studentId)
  const getStudentPoints = useDataStore((s) => s.getStudentPoints)
  const getStudentLevel = useDataStore((s) => s.getStudentLevel)

  const points = studentId ? getStudentPoints(studentId) : 0
  const level = studentId ? getStudentLevel(studentId) : null

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-accent text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Мои задания</h1>
            <p className="text-xs text-white/60">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {level && (
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl">
              <span className="text-sm">{level.emoji}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-bold">{points}</span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
