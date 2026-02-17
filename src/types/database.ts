// Типы для базы данных

export type UserRole = 'teacher' | 'parent' | 'student'
export type LessonStatus = 'planned' | 'completed' | 'missed' | 'rescheduled'
export type HomeworkStatus = 'done' | 'partial' | 'not_done'
export type OlympiadType = 'femo_spring' | 'femo_intl' | 'femo'
export type LessonCategory = 'olympiad' | 'textbook'
export type TaskType = 'multiple_choice' | 'short_answer' | 'open_ended'

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  grade: number
  textbook: string
  color: string
  avatar_url?: string
  access_token?: string // уникальный токен для входа ученика
}

export interface Schedule {
  id: string
  student_id: string
  day_of_week: number // 0=Вс, 1=Пн, ..., 6=Сб
  time: string // "20:00"
  lesson_type: string
}

export interface LessonPlan {
  id: string
  student_id: string
  week_number: number
  date: string
  day_label: string
  topic: string
  source: string
  olympiad_tasks: string
  homework: string
  status: LessonStatus
  order_index: number
  lesson_type: LessonCategory // олимпиада или учебник
  student?: Student
}

export interface LessonResult {
  id: string
  student_id: string
  lesson_plan_id?: string
  date: string
  topic: string
  understanding: number // 1-5
  tasks_solved: number
  tasks_correct: number
  homework_given: string
  homework_done: HomeworkStatus
  teacher_comment_private: string
  teacher_comment_parent: string
  created_at: string
  student?: Student
  lesson_plan?: LessonPlan
}

export interface KnowledgeBase {
  id: string
  section: string
  topic: string
  grade_4_level: string
  grade_5_level: string
  femo_spring_importance: number // 1-3, Весенний этап
  femo_intl_importance: number // 1-3, Международный этап
}

export interface OlympiadEvent {
  id: string
  name: string
  date: string
  type: OlympiadType
  description?: string
}

export interface MockResult {
  id: string
  student_id: string
  olympiad_event_id?: string
  date: string
  format: string
  score: number
  max_score: number
  time_min?: number
  comment: string
  student?: Student
}

export interface WeeklyReport {
  id: string
  student_id: string
  week_number: number
  week_start: string
  week_end: string
  topics_covered: string[]
  tasks_solved: number
  tasks_correct: number
  homework_done: boolean
  achievements: string        // что ребёнок достиг
  next_week_focus: string     // что будем делать дальше
  teacher_summary: string     // итог недели для родителя
  created_at: string
}

// Домашние задания
export interface Assignment {
  id: string
  student_id: string
  lesson_plan_id?: string
  title: string
  description: string
  due_date: string
  is_active: boolean
  created_at: string
}

export interface AssignmentTask {
  id: string
  assignment_id: string
  order_index: number
  task_type: TaskType
  question: string
  options?: string[]       // для multiple_choice
  correct_answer: string   // для автопроверки
  points: number
  image_url?: string
}

export interface StudentSubmission {
  id: string
  assignment_task_id: string
  student_id: string
  answer_text?: string
  answer_image_url?: string  // фото работы
  is_correct?: boolean
  submitted_at: string
}
