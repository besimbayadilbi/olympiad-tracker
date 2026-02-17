import { create } from 'zustand'
import type {
  Student, Schedule, LessonPlan, LessonResult,
  KnowledgeBase, OlympiadEvent, MockResult, WeeklyReport,
  Assignment, AssignmentTask, StudentSubmission,
} from '@/types/database'
import {
  seedStudents, seedSchedule, seedLessonPlans, seedKnowledgeBase,
  seedOlympiadEvents, seedLessonResults, seedWeeklyReports,
  seedAssignments, seedAssignmentTasks,
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
}))
