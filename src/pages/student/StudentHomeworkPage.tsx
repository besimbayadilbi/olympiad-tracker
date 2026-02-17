import { Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClipboardList, CheckCircle, Clock, ChevronRight } from 'lucide-react'

export default function StudentHomeworkPage() {
  const studentId = useAuthStore((s) => s.studentId)
  const { assignments, assignmentTasks, studentSubmissions } = useDataStore()

  const myAssignments = assignments
    .filter((a) => a.student_id === studentId && a.is_active)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const getProgress = (assignmentId: string) => {
    const tasks = assignmentTasks.filter((t) => t.assignment_id === assignmentId)
    const submitted = tasks.filter((t) =>
      studentSubmissions.some((s) => s.assignment_task_id === t.id && s.student_id === studentId)
    )
    return { total: tasks.length, done: submitted.length }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-accent" />
        Мои задания
      </h1>

      {myAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <p className="text-text-secondary">Заданий пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myAssignments.map((assignment) => {
            const { total, done } = getProgress(assignment.id)
            const isComplete = done === total && total > 0
            const percent = total > 0 ? Math.round((done / total) * 100) : 0

            return (
              <Link
                key={assignment.id}
                to={`/student/task/${assignment.id}`}
                className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isComplete
                        ? <CheckCircle className="w-5 h-5 text-success shrink-0" />
                        : <Clock className="w-5 h-5 text-warning shrink-0" />
                      }
                      <h3 className="font-medium text-sm truncate">{assignment.title}</h3>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-text-secondary">
                        Срок: {format(parseISO(assignment.due_date), 'd MMM', { locale: ru })}
                      </span>
                      <span className={`text-xs font-medium ${isComplete ? 'text-success' : 'text-warning'}`}>
                        {done}/{total} задач
                      </span>
                    </div>
                    {/* Прогресс-бар */}
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-success' : 'bg-accent'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary shrink-0 ml-3" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
