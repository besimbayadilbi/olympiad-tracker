import { useState, useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO, startOfWeek, endOfWeek, addDays, isToday, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Heart, Calendar, BookOpen, Trophy, ChevronDown, ChevronUp, Star, Target, Sparkles, Clock, ListChecks, MapPin } from 'lucide-react'

const understandingEmojis = ['', '\u{1F61F}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}']
const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export default function ParentDashboardPage() {
  const { students, lessonPlans, lessonResults, weeklyReports, olympiadEvents, schedule } = useDataStore()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const [activeStudent, setActiveStudent] = useState(students[0]?.id || '')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const student = students.find((s) => s.id === activeStudent)

  // Статистика ученика
  const stats = useMemo(() => {
    const results = lessonResults.filter((r) => r.student_id === activeStudent)
    const plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    const completed = plans.filter((lp) => lp.status === 'completed').length
    const remaining = plans.filter((lp) => lp.status === 'planned').length
    const total = plans.length
    const lastResult = results.sort((a, b) => b.date.localeCompare(a.date))[0]
    const weeksStudying = Math.ceil(completed / 4) || 1
    return { results, plans, completed, remaining, total, lastResult, weeksStudying }
  }, [lessonResults, lessonPlans, activeStudent])

  // Расписание ученика
  const studentSchedule = useMemo(
    () => schedule.filter((s) => s.student_id === activeStudent),
    [schedule, activeStudent]
  )

  // Расписание на неделю
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const wEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekLessons = lessonPlans.filter((lp) => {
    const d = parseISO(lp.date)
    return d >= weekStart && d <= wEnd && lp.student_id === activeStudent
  })

  // Предстоящие уроки (следующие 10)
  const upcomingLessons = useMemo(
    () => lessonPlans
      .filter((lp) => lp.student_id === activeStudent && lp.date >= todayStr && lp.status === 'planned')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10),
    [lessonPlans, activeStudent, todayStr]
  )

  // Общий план по неделям
  const weeklyPlan = useMemo(() => {
    const plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    const weeks: Record<number, { topics: string[]; completed: number; total: number; dates: string[] }> = {}
    plans.forEach((lp) => {
      const w = lp.week_number
      if (!weeks[w]) weeks[w] = { topics: [], completed: 0, total: 0, dates: [] }
      weeks[w].topics.push(lp.topic)
      weeks[w].total++
      weeks[w].dates.push(lp.date)
      if (lp.status === 'completed') weeks[w].completed++
    })
    return Object.entries(weeks)
      .map(([week, data]) => ({
        week: Number(week),
        ...data,
        startDate: data.dates.sort()[0],
        endDate: data.dates.sort().at(-1)!,
      }))
      .sort((a, b) => a.week - b.week)
  }, [lessonPlans, activeStudent])

  // Отчёты
  const reports = weeklyReports
    .filter((r) => r.student_id === activeStudent)
    .sort((a, b) => b.week_number - a.week_number)

  return (
    <div className="space-y-6 pb-8">
      {/* Приветствие */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold text-primary">
          <Heart className="w-5 h-5 inline text-danger mr-1" />
          Добро пожаловать!
        </h1>
        <p className="text-text-secondary text-sm mt-1">Прогресс ваших детей в олимпиадной математике</p>
      </div>

      {/* Табы учеников */}
      <div className="flex gap-2 justify-center">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStudent(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeStudent === s.id ? 'text-white shadow-lg' : 'bg-white border border-border text-text-secondary'
            }`}
            style={activeStudent === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Карточка ученика */}
      {student && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: student.color }}
            >
              {student.name[0]}
            </div>
            <div>
              <h2 className="font-bold text-lg">{student.name}</h2>
              <p className="text-sm text-text-secondary">{student.grade} класс</p>
              <p className="text-xs text-text-secondary">
                Учится {stats.weeksStudying} нед., прошёл(а) {stats.completed} уроков
              </p>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Прогресс плана</span>
              <span className="font-medium">{stats.completed} / {stats.total} уроков ({stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}%)</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`, backgroundColor: student.color }}
              />
            </div>
          </div>

          {/* Счётчик оставшихся уроков */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-success/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-success">{stats.completed}</p>
              <p className="text-xs text-text-secondary">Проведено</p>
            </div>
            <div className="bg-accent/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-accent">{stats.remaining}</p>
              <p className="text-xs text-text-secondary">Осталось</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-text-secondary">Всего</p>
            </div>
          </div>

          {/* Последний урок */}
          {stats.lastResult && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-text-secondary">Последний урок</p>
              <p className="font-medium text-sm">{stats.lastResult.topic}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl">{understandingEmojis[stats.lastResult.understanding]}</span>
                <span className="text-sm text-text-secondary">
                  Понимание: {stats.lastResult.understanding}/5
                </span>
              </div>
              {stats.lastResult.teacher_comment_parent && (
                <p className="text-sm text-text-secondary mt-2 italic">
                  «{stats.lastResult.teacher_comment_parent}»
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Олимпиады — обратный отсчёт */}
      <div className="grid grid-cols-2 gap-3">
        {olympiadEvents.map((evt) => {
          const daysLeft = differenceInDays(parseISO(evt.date), today)
          return (
            <div key={evt.id} className="bg-white rounded-xl border border-border p-4 text-center">
              <Trophy className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="font-bold text-2xl" style={{ color: student?.color }}>{daysLeft > 0 ? daysLeft : 0}</p>
              <p className="text-xs font-medium">{evt.name}</p>
              <p className="text-xs text-text-secondary">{format(parseISO(evt.date), 'd MMMM', { locale: ru })}</p>
              {evt.description && <p className="text-xs text-text-secondary mt-1">{evt.description}</p>}
            </div>
          )
        })}
      </div>

      {/* Постоянное расписание */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Расписание занятий
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {studentSchedule.map((s) => (
            <div key={s.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
              <span className={`w-2 h-2 rounded-full ${s.lesson_type === 'olympiad' ? 'bg-accent' : 'bg-primary'}`} />
              <span className="font-medium text-sm">{dayLabels[s.day_of_week]}</span>
              <span className="text-sm text-text-secondary">{s.time}</span>
            </div>
          ))}
        </div>
        {studentSchedule.length > 4 && (
          <p className="text-xs text-text-secondary mt-2">* Будние дни добавляются с марта</p>
        )}
      </div>

      {/* Расписание на текущую неделю */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Эта неделя
        </h2>
        <div className="space-y-2">
          {weekDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const lessons = weekLessons.filter((lp) => lp.date === dayStr)
            if (lessons.length === 0) return null
            return (
              <div key={dayStr} className={`flex items-center gap-3 p-3 rounded-xl ${isToday(day) ? 'bg-accent/5 border border-accent/20' : 'bg-gray-50'}`}>
                <div className="text-center w-12">
                  <p className="text-xs text-text-secondary">{format(day, 'EEE', { locale: ru })}</p>
                  <p className="font-bold">{format(day, 'd')}</p>
                </div>
                <div className="flex-1">
                  {lessons.map((l) => (
                    <div key={l.id} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${l.lesson_type === 'olympiad' ? 'bg-accent' : 'bg-primary'}`} />
                      <div>
                        <p className="text-sm font-medium">{l.topic}</p>
                        <p className="text-xs text-text-secondary">
                          {l.lesson_type === 'olympiad' ? 'Олимпиада' : 'Учебник'} — {l.status === 'completed' ? 'Проведён' : 'Запланирован'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {weekLessons.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-2">На этой неделе нет уроков</p>
          )}
        </div>
      </div>

      {/* Предстоящие уроки */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-accent" />
          Ближайшие уроки
        </h2>
        {upcomingLessons.length > 0 ? (
          <div className="space-y-2">
            {upcomingLessons.map((lp) => (
              <div key={lp.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                <div className="text-center w-14 shrink-0">
                  <p className="text-xs text-text-secondary">{format(parseISO(lp.date), 'EEE', { locale: ru })}</p>
                  <p className="text-sm font-bold">{format(parseISO(lp.date), 'd MMM', { locale: ru })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lp.topic}</p>
                  <p className="text-xs text-text-secondary">{lp.source}</p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${lp.lesson_type === 'olympiad' ? 'bg-accent' : 'bg-primary'}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-2">Все уроки проведены!</p>
        )}
      </div>

      {/* Общий план по неделям */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          Общий план подготовки
        </h2>
        <div className="space-y-2">
          {weeklyPlan.map((w) => {
            const isCurrentWeek = todayStr >= w.startDate && todayStr <= w.endDate
            const isPast = w.endDate < todayStr
            const progress = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0
            return (
              <div
                key={w.week}
                className={`rounded-xl p-3 border ${
                  isCurrentWeek ? 'border-accent/30 bg-accent/5' : isPast ? 'border-border bg-gray-50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Нед. {w.week}</span>
                    <span className="text-xs text-text-secondary">
                      {format(parseISO(w.startDate), 'd MMM', { locale: ru })} — {format(parseISO(w.endDate), 'd MMM', { locale: ru })}
                    </span>
                    {isCurrentWeek && <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded-md">сейчас</span>}
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{w.completed}/{w.total}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: student?.color || '#2A9D8F' }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {w.topics.slice(0, 4).map((t, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-text-secondary rounded-md px-1.5 py-0.5 truncate max-w-[200px]">
                      {t}
                    </span>
                  ))}
                  {w.topics.length > 4 && (
                    <span className="text-xs text-text-secondary">+{w.topics.length - 4}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Еженедельные отчёты */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          Еженедельные отчёты
        </h2>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">Неделя {report.week_number}</p>
                    <p className="text-xs text-text-secondary">
                      {format(parseISO(report.week_start), 'd MMM', { locale: ru })} — {format(parseISO(report.week_end), 'd MMM', { locale: ru })}
                    </p>
                  </div>
                  {expandedReport === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedReport === report.id && (
                  <div className="p-3 pt-0 space-y-3 text-sm">
                    {/* Итог от учителя */}
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Итог недели
                      </p>
                      <p className="text-text-secondary">{report.teacher_summary}</p>
                    </div>

                    <div>
                      <p className="font-medium text-xs text-text-secondary mb-1">Что прошли:</p>
                      <ul className="list-disc list-inside text-text-secondary">
                        {report.topics_covered.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-bold">{report.tasks_solved}</p>
                        <p className="text-xs text-text-secondary">Задач</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-bold">{report.tasks_correct}</p>
                        <p className="text-xs text-text-secondary">Верно</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-bold">{report.tasks_solved > 0 ? Math.round(report.tasks_correct / report.tasks_solved * 100) : 0}%</p>
                        <p className="text-xs text-text-secondary">Точность</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-xs text-text-secondary">Д/З: {report.homework_done ? 'Выполнено' : 'Не выполнено'}</p>
                    </div>

                    {/* Достижения */}
                    <div className="bg-success/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-success mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Достижения
                      </p>
                      <p className="text-text-secondary">{report.achievements}</p>
                    </div>

                    {/* Фокус на следующую неделю */}
                    <div className="bg-accent/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> План на следующую неделю
                      </p>
                      <p className="text-text-secondary">{report.next_week_focus}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-4">Отчёты пока не добавлены</p>
        )}
      </div>

      {/* Чем мы занимаемся */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Чем мы занимаемся
          </h2>
          {showAbout ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showAbout && (
          <div className="mt-3 space-y-3 text-sm text-text-secondary">
            <p><strong>FEMO</strong> (FizMat Elementary Math Olympiad) — международная олимпиада по математике. Проходит в два этапа: Весенний онлайн-раунд (март) и Международный очный этап (июнь, Анталья).</p>
            <p>Задачи FEMO требуют творческого подхода, глубокого понимания математики и нестандартного мышления.</p>
            <p className="font-medium text-text">Направления подготовки:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Арифметика и числа</li>
              <li>Геометрия</li>
              <li>Логические задачи</li>
              <li>Комбинаторика</li>
              <li>Текстовые задачи</li>
              <li>Головоломки и ребусы</li>
            </ul>
            <p>Олимпиадная математика развивает критическое мышление, учит не бояться сложных задач и находить красивые решения.</p>
          </div>
        )}
      </div>
    </div>
  )
}
