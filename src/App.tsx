import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import LoginPage from '@/pages/LoginPage'
import TeacherLayout from '@/components/layout/TeacherLayout'
import ParentLayout from '@/components/layout/ParentLayout'
import StudentLayout from '@/components/layout/StudentLayout'
import DashboardPage from '@/pages/teacher/DashboardPage'
import LessonPlanPage from '@/pages/teacher/LessonPlanPage'
import LessonRecordPage from '@/pages/teacher/LessonRecordPage'
import ProgressPage from '@/pages/teacher/ProgressPage'
import KnowledgeBasePage from '@/pages/teacher/KnowledgeBasePage'
import OlympiadsPage from '@/pages/teacher/OlympiadsPage'
import GeneralPlanPage from '@/pages/teacher/GeneralPlanPage'
import AssignmentsPage from '@/pages/teacher/AssignmentsPage'
import ParentDashboardPage from '@/pages/parent/ParentDashboardPage'
import StudentHomeworkPage from '@/pages/student/StudentHomeworkPage'
import StudentTaskPage from '@/pages/student/StudentTaskPage'
import RewardShopPage from '@/pages/student/RewardShopPage'
import StudentAccessPage from '@/pages/student/StudentAccessPage'

function App() {
  const user = useAuthStore((s) => s.user)
  const init = useDataStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичный маршрут — вход ученика по ссылке */}
        <Route path="/student/access/:token" element={<StudentAccessPage />} />

        {!user ? (
          <Route path="*" element={<LoginPage />} />
        ) : (
          <>
            {user.role === 'teacher' && (
              <Route path="/" element={<TeacherLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="plan" element={<LessonPlanPage />} />
                <Route path="record" element={<LessonRecordPage />} />
                <Route path="record/:planId" element={<LessonRecordPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="knowledge" element={<KnowledgeBasePage />} />
                <Route path="olympiads" element={<OlympiadsPage />} />
                <Route path="general-plan" element={<GeneralPlanPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
              </Route>
            )}

            {user.role === 'parent' && (
              <Route path="/" element={<ParentLayout />}>
                <Route index element={<ParentDashboardPage />} />
              </Route>
            )}

            {user.role === 'student' && (
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentHomeworkPage />} />
                <Route path="task/:assignmentId" element={<StudentTaskPage />} />
                <Route path="shop" element={<RewardShopPage />} />
              </Route>
            )}

            <Route path="*" element={<Navigate to={user.role === 'student' ? '/student' : '/'} replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
