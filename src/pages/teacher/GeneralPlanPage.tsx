import { useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Map, Trophy, BookOpen, CheckCircle, Circle, Clock } from 'lucide-react'

export default function GeneralPlanPage() {
  const { students, lessonPlans, olympiadEvents } = useDataStore()
  const today = new Date()

  const weekData = useMemo(() => {
    const weeks = [...new Set(lessonPlans.map((lp) => lp.week_number))].sort((a, b) => a - b)

    return weeks.map((weekNum) => {
      const weekPlans = lessonPlans.filter((lp) => lp.week_number === weekNum)
      const firstDate = weekPlans.sort((a, b) => a.date.localeCompare(b.date))[0]?.date
      const lastDate = weekPlans.sort((a, b) => b.date.localeCompare(a.date))[0]?.date

      const studentData = students.map((student) => {
        const plans = weekPlans.filter((lp) => lp.student_id === student.id)
        const completed = plans.filter((lp) => lp.status === 'completed').length
        const total = plans.length
        const olympiadLessons = plans.filter((lp) => lp.lesson_type === 'olympiad')
        const textbookLessons = plans.filter((lp) => lp.lesson_type === 'textbook')
        return { student, plans, completed, total, olympiadLessons, textbookLessons }
      })

      // Олимпиады на этой неделе
      const weekOlympiads = olympiadEvents.filter((evt) => {
        if (!firstDate || !lastDate) return false
        return evt.date >= firstDate && evt.date <= lastDate
      })

      const allCompleted = weekPlans.every((lp) => lp.status === 'completed')
      const hasPlanned = weekPlans.some((lp) => lp.status === 'planned')
      const isPast = lastDate ? parseISO(lastDate) < today : false

      return { weekNum, firstDate, lastDate, studentData, weekOlympiads, allCompleted, hasPlanned, isPast }
    })
  }, [lessonPlans, students, olympiadEvents, today])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Map className="w-6 h-6 text-accent" />
          Общий план
        </h1>
        <div className="text-sm text-text-secondary">
          {weekData.length} недель, {lessonPlans.length} уроков
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {students.map((student) => {
          const plans = lessonPlans.filter((lp) => lp.student_id === student.id)
          const completed = plans.filter((lp) => lp.status === 'completed').length
          return (
            <div key={student.id} className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-text-secondary mb-1">{student.name}</p>
              <p className="text-xl font-bold" style={{ color: student.color }}>
                {completed}/{plans.length}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${plans.length > 0 ? (completed / plans.length) * 100 : 0}%`, backgroundColor: student.color }}
                />
              </div>
            </div>
          )
        })}
        {olympiadEvents.map((evt) => {
          const daysLeft = differenceInDays(parseISO(evt.date), today)
          return (
            <div key={evt.id} className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-text-secondary mb-1">{evt.name}</p>
              <p className="text-xl font-bold text-accent">
                {daysLeft > 0 ? `${daysLeft} дн.` : 'Прошла'}
              </p>
              <p className="text-xs text-text-secondary mt-1">{format(parseISO(evt.date), 'd MMM yyyy', { locale: ru })}</p>
            </div>
          )
        })}
      </div>

      {/* Таймлайн */}
      <div className="space-y-0">
        {weekData.map(({ weekNum, firstDate, lastDate, studentData, weekOlympiads, allCompleted, isPast }) => (
          <div key={weekNum} className="relative flex gap-4">
            {/* Вертикальная линия */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                allCompleted
                  ? 'bg-success text-white'
                  : isPast
                    ? 'bg-warning text-white'
                    : 'bg-gray-200 text-text-secondary'
              }`}>
                {allCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isPast ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <div className="w-0.5 flex-1 bg-gray-200 min-h-[20px]" />
            </div>

            {/* Контент недели */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-sm">Неделя {weekNum}</h3>
                {firstDate && lastDate && (
                  <span className="text-xs text-text-secondary">
                    {format(parseISO(firstDate), 'd MMM', { locale: ru })} — {format(parseISO(lastDate), 'd MMM', { locale: ru })}
                  </span>
                )}
              </div>

              {/* Олимпиады-вехи */}
              {weekOlympiads.map((evt) => (
                <div key={evt.id} className="mb-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">{evt.name} — {format(parseISO(evt.date), 'd MMMM', { locale: ru })}</span>
                </div>
              ))}

              {/* Уроки по ученикам */}
              <div className="grid md:grid-cols-2 gap-2">
                {studentData.map(({ student, plans, completed, total, olympiadLessons, textbookLessons }) => (
                  <div key={student.id} className="bg-white rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: student.color }}
                      >
                        {student.name[0]}
                      </div>
                      <span className="text-sm font-medium">{student.name}</span>
                      <span className="text-xs text-text-secondary ml-auto">{completed}/{total}</span>
                    </div>

                    <div className="space-y-1">
                      {plans.sort((a, b) => a.order_index - b.order_index).map((plan) => (
                        <div
                          key={plan.id}
                          className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg ${
                            plan.status === 'completed'
                              ? 'bg-success/5 text-text-secondary line-through'
                              : plan.lesson_type === 'olympiad'
                                ? 'bg-accent/5'
                                : 'bg-primary/5'
                          }`}
                        >
                          {plan.lesson_type === 'olympiad'
                            ? <Trophy className="w-3 h-3 text-accent shrink-0" />
                            : <BookOpen className="w-3 h-3 text-primary shrink-0" />
                          }
                          <span className="truncate">{plan.topic}</span>
                          {plan.status === 'completed' && <CheckCircle className="w-3 h-3 text-success shrink-0 ml-auto" />}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2 text-[10px] text-text-secondary">
                      <span>🏆 {olympiadLessons.length} олимп.</span>
                      <span>📚 {textbookLessons.length} учебник</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
