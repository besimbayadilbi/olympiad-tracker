import { create } from 'zustand'
import type {
  Student, Schedule, LessonPlan, LessonResult,
  KnowledgeBase, OlympiadEvent, MockResult, WeeklyReport,
  Assignment, AssignmentTask, StudentSubmission, Resource, StudentBadge, BadgeType,
} from '@/types/database'
import {
  seedStudents, seedSchedule, seedLessonPlans, seedKnowledgeBase,
  seedOlympiadEvents, seedLessonResults, seedWeeklyReports,
  seedAssignments, seedAssignmentTasks, seedResources, seedBadges, BONUS_CONFIG,
} from '@/lib/seedData'

interface DataState {
  students: Student[]
  schedule: Schedule[]
  lessonPlans: LessonPlan[]
  lessonResults: LessonResult[]
  knowledgeBase: KnowledgeBase[]
  olympiadEvents: OlympiadEvent[]
  mockResults: MockResult[]
  weeklyReports: WeeklyReport[]
  assignments: Assignment[]
  assignmentTasks: AssignmentTask[]
  studentSubmissions: StudentSubmission[]
  resources: Resource[]
  badges: StudentBadge[]
  initialized: boolean

  init: () => void
  addLessonResult: (result: LessonResult) => void
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void
  addWeeklyReport: (report: WeeklyReport) => void
  addMockResult: (result: MockResult) => void
  reorderLessonPlans: (studentId: string, plans: LessonPlan[]) => void
  addAssignment: (assignment: Assignment) => void
  addAssignmentTask: (task: AssignmentTask) => void
  addSubmission: (submission: StudentSubmission) => void
  getAssignmentsByStudent: (studentId: string) => Assignment[]
  getTasksByAssignment: (assignmentId: string) => AssignmentTask[]
  getSubmissionsByStudent: (studentId: string) => StudentSubmission[]
  getStudentPoints: (studentId: string) => number
  getStudentLevel: (studentId: string) => { name: string; emoji: string; min_points: number; nextLevel?: typeof BONUS_CONFIG.levels[0] }
  getStudentBadges: (studentId: string) => StudentBadge[]
  checkAndAwardBadges: (studentId: string) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  students: [],
  schedule: [],
  lessonPlans: [],
  lessonResults: [],
  knowledgeBase: [],
  olympiadEvents: [],
  mockResults: [],
  weeklyReports: [],
  assignments: [],
  assignmentTasks: [],
  studentSubmissions: [],
  resources: [],
  badges: [],
  initialized: false,

  init: () => {
    if (get().initialized) return
    set({
      students: seedStudents,
      schedule: seedSchedule,
      lessonPlans: seedLessonPlans,
      lessonResults: seedLessonResults,
      knowledgeBase: seedKnowledgeBase,
      olympiadEvents: seedOlympiadEvents,
      weeklyReports: seedWeeklyReports,
      assignments: seedAssignments,
      assignmentTasks: seedAssignmentTasks,
      mockResults: [],
      studentSubmissions: [],
      resources: seedResources,
      badges: [...seedBadges],
      initialized: true,
    })
  },

  addLessonResult: (result) => {
    set((s) => ({
      lessonResults: [...s.lessonResults, result],
      lessonPlans: result.lesson_plan_id
        ? s.lessonPlans.map((lp) =>
            lp.id === result.lesson_plan_id ? { ...lp, status: 'completed' as const } : lp
          )
        : s.lessonPlans,
    }))
  },

  updateLessonPlan: (id, updates) => {
    set((s) => ({
      lessonPlans: s.lessonPlans.map((lp) =>
        lp.id === id ? { ...lp, ...updates } : lp
      ),
    }))
  },

  addWeeklyReport: (report) => {
    set((s) => ({ weeklyReports: [...s.weeklyReports, report] }))
  },

  addMockResult: (result) => {
    set((s) => ({ mockResults: [...s.mockResults, result] }))
  },

  reorderLessonPlans: (studentId, plans) => {
    set((s) => ({
      lessonPlans: [
        ...s.lessonPlans.filter((lp) => lp.student_id !== studentId),
        ...plans,
      ],
    }))
  },

  addAssignment: (assignment) => {
    set((s) => ({ assignments: [...s.assignments, assignment] }))
  },

  addAssignmentTask: (task) => {
    set((s) => ({ assignmentTasks: [...s.assignmentTasks, task] }))
  },

  addSubmission: (submission) => {
    set((s) => ({ studentSubmissions: [...s.studentSubmissions, submission] }))
    if (submission.student_id) {
      get().checkAndAwardBadges(submission.student_id)
    }
  },

  getAssignmentsByStudent: (studentId) => {
    return get().assignments.filter((a) => a.student_id === studentId && a.is_active)
  },

  getTasksByAssignment: (assignmentId) => {
    return get().assignmentTasks
      .filter((t) => t.assignment_id === assignmentId)
      .sort((a, b) => a.order_index - b.order_index)
  },

  getSubmissionsByStudent: (studentId) => {
    return get().studentSubmissions.filter((s) => s.student_id === studentId)
  },

  getStudentPoints: (studentId) => {
    const subs = get().studentSubmissions.filter((s) => s.student_id === studentId)
    const tasks = get().assignmentTasks
    let points = 0

    for (const sub of subs) {
      const task = tasks.find((t) => t.id === sub.assignment_task_id)
      if (!task) continue
      if (sub.is_correct === true) {
        points += BONUS_CONFIG.points_per_correct
      } else if (sub.is_correct === false) {
        points += BONUS_CONFIG.points_per_attempt
      } else {
        points += BONUS_CONFIG.points_per_open_ended
      }
    }

    // Perfect assignment bonus
    const assignments = get().assignments.filter((a) => a.student_id === studentId)
    for (const asgn of assignments) {
      const asgnTasks = tasks.filter((t) => t.assignment_id === asgn.id)
      if (asgnTasks.length === 0) continue
      const asgnSubs = asgnTasks.map((t) => subs.find((s) => s.assignment_task_id === t.id))
      if (asgnSubs.every((s) => s?.is_correct === true)) {
        points += BONUS_CONFIG.points_perfect_bonus
      }
    }

    return points
  },

  getStudentLevel: (studentId) => {
    const points = get().getStudentPoints(studentId)
    const levels = BONUS_CONFIG.levels
    let current = levels[0]
    let nextLevel: typeof levels[0] | undefined

    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].min_points) {
        current = levels[i]
        nextLevel = levels[i + 1]
        break
      }
    }

    return { ...current, nextLevel }
  },

  getStudentBadges: (studentId) => {
    return get().badges.filter((b) => b.student_id === studentId)
  },

  checkAndAwardBadges: (studentId) => {
    const state = get()
    const existingBadges = state.badges.filter((b) => b.student_id === studentId)
    const has = (type: BadgeType) => existingBadges.some((b) => b.badge_type === type)
    const subs = state.studentSubmissions.filter((s) => s.student_id === studentId)
    const points = state.getStudentPoints(studentId)
    const newBadges: StudentBadge[] = []
    const now = new Date().toISOString()

    if (!has('first_task') && subs.length >= 1) {
      newBadges.push({ id: `badge-${Date.now()}-1`, student_id: studentId, badge_type: 'first_task', earned_at: now })
    }
    if (!has('points_50') && points >= 50) {
      newBadges.push({ id: `badge-${Date.now()}-2`, student_id: studentId, badge_type: 'points_50', earned_at: now })
    }
    if (!has('points_100') && points >= 100) {
      newBadges.push({ id: `badge-${Date.now()}-3`, student_id: studentId, badge_type: 'points_100', earned_at: now })
    }
    if (!has('points_250') && points >= 250) {
      newBadges.push({ id: `badge-${Date.now()}-4`, student_id: studentId, badge_type: 'points_250', earned_at: now })
    }

    if (!has('perfect_assignment')) {
      const assignments = state.assignments.filter((a) => a.student_id === studentId)
      for (const asgn of assignments) {
        const tasks = state.assignmentTasks.filter((t) => t.assignment_id === asgn.id)
        if (tasks.length === 0) continue
        if (tasks.every((t) => subs.find((s) => s.assignment_task_id === t.id)?.is_correct === true)) {
          newBadges.push({ id: `badge-${Date.now()}-5`, student_id: studentId, badge_type: 'perfect_assignment', earned_at: now })
          break
        }
      }
    }

    const submissionDays = [...new Set(subs.map((s) => s.submitted_at.slice(0, 10)))].sort()
    if (submissionDays.length >= 3 && !has('streak_3')) {
      for (let i = 0; i <= submissionDays.length - 3; i++) {
        const d1 = new Date(submissionDays[i]).getTime()
        const d2 = new Date(submissionDays[i + 1]).getTime()
        const d3 = new Date(submissionDays[i + 2]).getTime()
        if ((d2 - d1) === 86400000 && (d3 - d2) === 86400000) {
          newBadges.push({ id: `badge-${Date.now()}-6`, student_id: studentId, badge_type: 'streak_3', earned_at: now })
          break
        }
      }
    }

    if (newBadges.length > 0) {
      set((s) => ({ badges: [...s.badges, ...newBadges] }))
    }
  },
}))
