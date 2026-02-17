import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { X, BookOpen, Trophy, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LessonPlan, LessonResult, Student } from '@/types/database'

interface Props {
  date: Date
  lessons: LessonPlan[]
  results: LessonResult[]
  students: Student[]
  onClose: () => void
}

const statusLabel: Record<string, string> = {
  planned: 'Запланирован',
  completed: 'Проведён',
  missed: 'Пропущен',
  rescheduled: 'Перенесён',
}

export default function LessonDayModal({ date, lessons, results, students, onClose }: Props) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">
          {format(date, "d MMMM, EEEE", { locale: ru })}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => {
          const student = students.find((s) => s.id === lesson.student_id)
          const result = results.find((r) => r.lesson_plan_id === lesson.id)

          return (
            <div key={lesson.id} className="border border-border rounded-xl p-3 space-y-2">
              {/* Шапка */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: student?.color }}
                  >
                    {student?.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{student?.name}</p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      {lesson.lesson_type === 'olympiad'
                        ? <><Trophy className="w-3 h-3 text-accent" /> Олимпиада</>
                        : <><BookOpen className="w-3 h-3 text-primary" /> Учебник</>
                      }
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  lesson.status === 'completed' ? 'bg-success/10 text-success' :
                  lesson.status === 'planned' ? 'bg-gray-100 text-gray-600' :
                  lesson.status === 'missed' ? 'bg-danger/10 text-danger' :
                  'bg-warning/10 text-warning'
                }`}>
                  {statusLabel[lesson.status]}
                </span>
              </div>

              {/* Тема */}
              <div>
                <p className="text-sm font-medium">{lesson.topic}</p>
                <p className="text-xs text-text-secondary">{lesson.source}</p>
              </div>

              {/* Д/З и задачи */}
              <div className="flex flex-wrap gap-2 text-xs">
                {lesson.homework && (
                  <span className="bg-gray-50 px-2 py-1 rounded-lg">Д/З: {lesson.homework}</span>
                )}
                {lesson.olympiad_tasks && (
                  <span className="bg-accent/5 text-accent px-2 py-1 rounded-lg">{lesson.olympiad_tasks}</span>
                )}
              </div>

              {/* Результат если проведён */}
              {result && (
                <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Понимание: {result.understanding}/5</span>
                    <span>•</span>
                    <span>{result.tasks_correct}/{result.tasks_solved} верно</span>
                  </div>
                  {result.teacher_comment_parent && (
                    <p className="text-xs text-text-secondary italic">«{result.teacher_comment_parent}»</p>
                  )}
                </div>
              )}

              {/* Кнопка провести */}
              {lesson.status === 'planned' && (
                <Link
                  to={`/record/${lesson.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  <Clock className="w-3 h-3" /> Провести урок
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
