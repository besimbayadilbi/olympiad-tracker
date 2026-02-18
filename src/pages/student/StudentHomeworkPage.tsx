import { Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { BONUS_CONFIG } from '@/lib/seedData'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClipboardList, CheckCircle, Clock, ChevronRight, Star, Trophy } from 'lucide-react'

export default function StudentHomeworkPage() {
  const studentId = useAuthStore((s) => s.studentId)
  const { assignments, assignmentTasks, studentSubmissions,
    getStudentPoints, getStudentLevel, getStudentBadges } = useDataStore()

  const points = studentId ? getStudentPoints(studentId) : 0
  const level = studentId ? getStudentLevel(studentId) : null
  const badges = studentId ? getStudentBadges(studentId) : []

  const myAssignments = assignments
    .filter((a) => a.student_id === studentId && a.is_active)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const getProgress = (assignmentId: string) => {
    const tasks = assignmentTasks.filter((t) => t.assignment_id === assignmentId)
    const submitted = tasks.filter((t) =>
      studentSubmissions.some((s) => s.assignment_task_id === t.id && s.student_id === studentId)
    )
    const correct = tasks.filter((t) =>
      studentSubmissions.some((s) => s.assignment_task_id === t.id && s.student_id === studentId && s.is_correct === true)
    )
    return { total: tasks.length, done: submitted.length, correct: correct.length }
  }

  const progressToNext = level?.nextLevel
    ? Math.min(100, Math.round(((points - level.min_points) / (level.nextLevel.min_points - level.min_points)) * 100))
    : 100

  return (
    <div className="space-y-4">
      {/* Уровень и баллы */}
      {level && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{level.emoji}</span>
              <div>
                <p className="font-bold text-sm">{level.name}</p>
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {points} баллов
                </p>
              </div>
            </div>
            {level.nextLevel && (
              <div className="text-right">
                <p className="text-xs text-text-secondary">До «{level.nextLevel.name}»</p>
                <p className="text-xs font-medium text-accent">{level.nextLevel.min_points - points} б.</p>
              </div>
            )}
          </div>
          {level.nextLevel && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-yellow-400 rounded-full transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          )}

          {/* Бейджи */}
          {badges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-text-secondary">Достижения</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((badge) => {
                  const info = BONUS_CONFIG.badges[badge.badge_type]
                  return (
                    <span
                      key={badge.id}
                      title={info?.description}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-accent/5 rounded-lg text-xs"
                    >
                      <span>{info?.emoji}</span>
                      <span className="font-medium">{info?.name}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Заголовок */}
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
            const { total, done, correct } = getProgress(assignment.id)
            const isComplete = done === total && total > 0
            const isPerfect = correct === total && total > 0
            const percent = total > 0 ? Math.round((done / total) * 100) : 0
            const potentialPoints = total * BONUS_CONFIG.points_per_correct

            return (
              <Link
                key={assignment.id}
                to={`/student/task/${assignment.id}`}
                className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isPerfect
                        ? <span className="text-lg">💯</span>
                        : isComplete
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
                      <span className="text-xs text-accent flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        до {potentialPoints} б.
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isPerfect ? 'bg-yellow-400' : isComplete ? 'bg-success' : 'bg-accent'}`}
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

      {/* Как заработать баллы */}
      <div className="bg-gradient-to-br from-accent/5 to-yellow-50 rounded-2xl border border-accent/20 p-4">
        <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          Как заработать баллы?
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-[10px] font-bold">+{BONUS_CONFIG.points_per_correct}</span>
            <span>Верный ответ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-warning/20 text-warning flex items-center justify-center text-[10px] font-bold">+{BONUS_CONFIG.points_per_attempt}</span>
            <span>Попытка</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">+{BONUS_CONFIG.points_per_open_ended}</span>
            <span>Фото решения</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-[10px] font-bold">+{BONUS_CONFIG.points_perfect_bonus}</span>
            <span>100% в задании</span>
          </div>
        </div>
      </div>
    </div>
  )
}
