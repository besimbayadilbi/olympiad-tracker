import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { format, isToday, isTomorrow, parseISO, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { TrendingUp, AlertTriangle, Trophy, Play } from 'lucide-react'
import FullCalendar from '@/components/calendar/FullCalendar'

export default function DashboardPage() {
  const { students, schedule, lessonPlans, lessonResults, olympiadEvents } = useDataStore()
  const today = new Date()

  // Ближайший урок
  const nextLesson = useMemo(() => {
    const upcoming = lessonPlans
      .filter((lp) => lp.status === 'planned' && parseISO(lp.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
    return upcoming[0]
  }, [lessonPlans, today])

  const nextLessonStudent = nextLesson
    ? students.find((s) => s.id === nextLesson.student_id)
    : null

  // Статистика по ученикам
  const studentStats = useMemo(() => {
    return students.map((student) => {
      const results = lessonResults.filter((r) => r.student_id === student.id)
      const plans = lessonPlans.filter((lp) => lp.student_id === student.id)
      const completed = plans.filter((lp) => lp.status === 'completed').length
      const total = plans.length
      const avgCorrect = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.tasks_correct / r.tasks_solved) * 100, 0) / results.length)
        : 0
      const lastResult = results.sort((a, b) => b.date.localeCompare(a.date))[0]
      const nextPlan = plans
        .filter((lp) => lp.status === 'planned' && parseISO(lp.date) >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0]
      const studentSchedule = schedule.filter((s) => s.student_id === student.id)

      return { student, results, plans, completed, total, avgCorrect, lastResult, nextPlan, studentSchedule }
    })
  }, [students, lessonResults, lessonPlans, schedule, today])

  // Уведомления
  const notifications = useMemo(() => {
    const notifs: { text: string; type: 'warning' | 'success' | 'info' }[] = []

    olympiadEvents.forEach((evt) => {
      const days = differenceInDays(parseISO(evt.date), today)
      if (days > 0 && days <= 30) {
        notifs.push({ text: `До ${evt.name} осталось ${days} дней`, type: 'info' })
      }
    })

    students.forEach((student) => {
      const results = lessonResults
        .filter((r) => r.student_id === student.id)
        .sort((a, b) => b.date.localeCompare(a.date))
      const lastTwo = results.slice(0, 2)
      if (lastTwo.length === 2 && lastTwo.every((r) => r.homework_done === 'not_done')) {
        notifs.push({ text: `${student.name} не выполнил(а) Д/З 2 раза подряд`, type: 'warning' })
      }
    })

    students.forEach((student) => {
      const results = lessonResults
        .filter((r) => r.student_id === student.id)
        .sort((a, b) => a.date.localeCompare(b.date))
      if (results.length >= 6) {
        const last3 = results.slice(-3)
        const prev3 = results.slice(-6, -3)
        const avgLast = last3.reduce((s, r) => s + r.tasks_correct / r.tasks_solved, 0) / 3
        const avgPrev = prev3.reduce((s, r) => s + r.tasks_correct / r.tasks_solved, 0) / 3
        const diff = Math.round((avgLast - avgPrev) * 100)
        if (diff >= 10) {
          notifs.push({ text: `${student.name} показал(а) рост +${diff}%`, type: 'success' })
        }
      }
    })

    return notifs
  }, [students, lessonResults, olympiadEvents, today])

  const understandingEmoji = ['', '\u{1F61F}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}']

  return (
    <div className="space-y-6">
      {/* Верхняя панель */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Привет, Адильби!</h1>
          <p className="text-text-secondary">
            {format(today, "EEEE, d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        {nextLesson && nextLessonStudent && (
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: nextLessonStudent.color }}>
              {nextLessonStudent.name[0]}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Ближайший урок</p>
              <p className="font-medium text-sm">{nextLessonStudent.name} — {nextLesson.topic}</p>
              <p className="text-xs text-accent">
                {isToday(parseISO(nextLesson.date)) ? 'Сегодня' : isTomorrow(parseISO(nextLesson.date)) ? 'Завтра' : format(parseISO(nextLesson.date), 'd MMM', { locale: ru })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Быстрые статы */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-secondary mb-1">Уроков проведено</p>
          <p className="text-2xl font-bold text-primary">{lessonResults.length}</p>
        </div>
        {studentStats.map(({ student, avgCorrect }) => (
          <div key={student.id} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-secondary mb-1">{student.name} — % верных</p>
            <p className="text-2xl font-bold" style={{ color: student.color }}>{avgCorrect}%</p>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-secondary mb-1">До олимпиады</p>
          <p className="text-2xl font-bold text-accent">
            {olympiadEvents.length > 0
              ? `${differenceInDays(parseISO(olympiadEvents[0].date), today)} дн.`
              : '—'}
          </p>
        </div>
      </div>

      {/* Карточки учеников */}
      <div className="grid md:grid-cols-2 gap-4">
        {studentStats.map(({ student, completed, total, lastResult, nextPlan }) => (
          <div key={student.id} className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: student.color }}
              >
                {student.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-sm text-text-secondary">{student.grade} класс • {student.textbook}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Прогресс плана</span>
                <span className="font-medium">{completed}/{total} уроков ({total > 0 ? Math.round(completed / total * 100) : 0}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                    backgroundColor: student.color,
                  }}
                />
              </div>
            </div>

            {lastResult && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-text-secondary mb-1">Последний урок — {format(parseISO(lastResult.date), 'd MMM', { locale: ru })}</p>
                <p className="font-medium text-sm">{lastResult.topic}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg">{understandingEmoji[lastResult.understanding]}</span>
                  <span className="text-sm text-text-secondary">
                    {lastResult.tasks_correct}/{lastResult.tasks_solved} верно ({Math.round(lastResult.tasks_correct / lastResult.tasks_solved * 100)}%)
                  </span>
                </div>
              </div>
            )}

            {nextPlan && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">Следующий урок</p>
                  <p className="text-sm font-medium">{format(parseISO(nextPlan.date), 'd MMM, EEEE', { locale: ru })}</p>
                  <p className="text-xs text-text-secondary">{nextPlan.topic}</p>
                </div>
                <Link
                  to={`/record/${nextPlan.id}`}
                  className="flex items-center gap-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition"
                >
                  <Play className="w-4 h-4" />
                  Провести
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Полный календарь */}
      <FullCalendar />

      {/* Уведомления */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-lg mb-3">Уведомления</h2>
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  n.type === 'warning' ? 'bg-warning/10 text-warning' :
                  n.type === 'success' ? 'bg-success/10 text-success' :
                  'bg-accent/10 text-accent'
                }`}
              >
                {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0" /> :
                 n.type === 'success' ? <TrendingUp className="w-4 h-4 shrink-0" /> :
                 <Trophy className="w-4 h-4 shrink-0" />}
                <span className="text-sm font-medium">{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
