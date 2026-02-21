import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/database'
import { seedStudents } from '@/lib/seedData'

// Пользователи системы
const USERS: { username: string; password: string; user: User; studentId?: string }[] = [
  {
    username: 'adilbi',
    password: 'adilbi123',
    user: {
      id: 'teacher-1',
      username: 'adilbi',
      role: 'teacher',
      name: 'Адильби',
      created_at: new Date().toISOString(),
    },
  },
  {
    username: 'elmira',
    password: 'elmira123',
    user: {
      id: 'parent-1',
      username: 'elmira',
      role: 'parent',
      name: 'Эльмира',
      created_at: new Date().toISOString(),
    },
  },
  {
    username: 'marzhan',
    password: 'marzhan123',
    user: {
      id: 'student-marzhan',
      username: 'marzhan',
      role: 'student',
      name: 'Маржан',
      created_at: new Date().toISOString(),
    },
    studentId: 'student-marzhan',
  },
  {
    username: 'batyrkhan',
    password: 'batyrkhan123',
    user: {
      id: 'student-batyrkhan',
      username: 'batyrkhan',
      role: 'student',
      name: 'Батырхан',
      created_at: new Date().toISOString(),
    },
    studentId: 'student-batyrkhan',
  },
]

interface AuthState {
  user: User | null
  studentId: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  loginAsDemo: (role: 'teacher' | 'parent' | 'student') => void
  loginByToken: (token: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      studentId: null,
      loading: false,

      login: async (username: string, password: string) => {
        set({ loading: true })
        const found = USERS.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        )
        if (found) {
          set({ user: found.user, studentId: found.studentId || null, loading: false })
          return true
        }
        set({ loading: false })
        return false
      },

      loginAsDemo: (role) => {
        if (role === 'student') {
          const student = seedStudents[0]
          set({
            user: {
              id: student.id,
              username: '',
              role: 'student',
              name: student.name,
              created_at: new Date().toISOString(),
            },
            studentId: student.id,
          })
        } else {
          const found = USERS.find((u) => u.user.role === role)
          if (found) {
            set({ user: found.user, studentId: null })
          }
        }
      },

      loginByToken: (token: string) => {
        const student = seedStudents.find((s) => s.access_token === token)
        if (!student) return false
        set({
          user: {
            id: student.id,
            username: '',
            role: 'student',
            name: student.name,
            created_at: new Date().toISOString(),
          },
          studentId: student.id,
        })
        return true
      },

      logout: () => {
        set({ user: null, studentId: null })
      },
    }),
    {
      name: 'tracker-auth',
      partialize: (state) => ({
        user: state.user,
        studentId: state.studentId,
      }),
    }
  )
)
