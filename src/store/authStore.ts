import { create } from 'zustand'
import type { User } from '@/types/database'
import { seedStudents } from '@/lib/seedData'

// Пользователи системы
const USERS: { email: string; password: string; user: User; studentId?: string }[] = [
  {
    email: 'adilbi@olympiad.kz',
    password: 'adilbi123',
    user: {
      id: 'teacher-1',
      email: 'adilbi@olympiad.kz',
      role: 'teacher',
      name: 'Адильби',
      created_at: new Date().toISOString(),
    },
  },
  {
    email: 'mama@olympiad.kz',
    password: 'mama123',
    user: {
      id: 'parent-1',
      email: 'mama@olympiad.kz',
      role: 'parent',
      name: 'Мама',
      created_at: new Date().toISOString(),
    },
  },
  {
    email: 'marzhan@olympiad.kz',
    password: 'marzhan123',
    user: {
      id: 'student-marzhan',
      email: 'marzhan@olympiad.kz',
      role: 'student',
      name: 'Маржан',
      created_at: new Date().toISOString(),
    },
    studentId: 'student-marzhan',
  },
  {
    email: 'batyrkhan@olympiad.kz',
    password: 'batyrkhan123',
    user: {
      id: 'student-batyrkhan',
      email: 'batyrkhan@olympiad.kz',
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
  login: (email: string, password: string) => Promise<boolean>
  loginAsDemo: (role: 'teacher' | 'parent' | 'student') => void
  loginByToken: (token: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  studentId: null,
  loading: false,

  login: async (email: string, password: string) => {
    set({ loading: true })
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
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
          email: '',
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
        email: '',
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
}))
