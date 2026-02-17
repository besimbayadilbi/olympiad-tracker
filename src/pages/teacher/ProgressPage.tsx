import { useState, useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { TrendingUp, Target, BookOpen, Award } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar,
} from 'recharts'

const understandingEmojis = ['', '\u{1F61F}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}']
const hwLabels: Record<string, string> = { done: 'Да', partial: 'Частично', not_done: 'Нет' }

export default function ProgressPage() {
  const { students, lessonResults, lessonPlans } = useDataStore()
  const [activeStudent, setActiveStudent] = useState(students[0]?.id || '')
  const student = students.find((s) => s.id === activeStudent)

  const results = useMemo(
    () => lessonResults
      .filter((r) => r.student_id === activeStudent)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [lessonResults, activeStudent]
  )

  // Данные для графика % верных
  const correctData = results.map((r, i) => ({
    name: format(parseISO(r.date), 'd.MM', { locale: ru }),
    percent: Math.round((r.tasks_correct / r.tasks_solved) * 100),
    lesson: i + 1,
  }))

  // Данные для радара навыков
  const radarData = useMemo(() => {
    const skills: Record<string, { correct: number; total: number }> = {
      'Арифметика': { correct: 0, total: 0 },
      'Геометрия': { correct: 0, total: 0 },
      'Логика': { correct: 0, total: 0 },
      'Комбинаторика': { correct: 0, total: 0 },
      'Текстовые задачи': { correct: 0, total: 0 },
    }
    results.forEach((r) => {
      const topic = r.topic.toLowerCase()
      let cat = 'Арифметика'
      if (topic.includes('геометр') || topic.includes('площ') || topic.includes('перим') || topic.includes('симметр')) cat = 'Геометрия'
      else if (topic.includes('логик') || topic.includes('рыцар') || topic.includes('дирихле') || topic.includes('инвариант')) cat = 'Логика'
      else if (topic.includes('комбинатор') || topic.includes('перебор') || topic.includes('правило произвед') || topic.includes('раскрас')) cat = 'Комбинаторика'
      else if (topic.includes('движ') || topic.includes('работ') || topic.includes('возраст') || topic.includes('перелив') || topic.includes('взвеш') || topic.includes('текст')) cat = 'Текстовые задачи'

      skills[cat].correct += r.tasks_correct
      skills[cat].total += r.tasks_solved
    })
    return Object.entries(skills).map(([name, { correct, total }]) => ({
      subject: name,
      value: total > 0 ? Math.round((correct / total) * 100) : 0,
      fullMark: 100,
    }))
  }, [results])

  // Задачи по неделям
  const weeklyData = useMemo(() => {
    const weeks: Record<number, { solved: number; correct: number }> = {}
    const plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    results.forEach((r) => {
      const plan = plans.find((p) => p.id === r.lesson_plan_id)
      const week = plan?.week_number || 1
      if (!weeks[week]) weeks[week] = { solved: 0, correct: 0 }
      weeks[week].solved += r.tasks_solved
      weeks[week].correct += r.tasks_correct
    })
    return Object.entries(weeks).map(([week, data]) => ({
      name: `Нед ${week}`,
      solved: data.solved,
      correct: data.correct,
    }))
  }, [results, lessonPlans, activeStudent])

  // Сводная статистика
  const stats = useMemo(() => {
    const totalLessons = results.length
    const plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    const missed = plans.filter((lp) => lp.status === 'missed').length
    const totalTasks = results.reduce((s, r) => s + r.tasks_solved, 0)
    const totalCorrect = results.reduce((s, r) => s + r.tasks_correct, 0)
    const avgUnderstanding = results.length > 0
      ? (results.reduce((s, r) => s + r.understanding, 0) / results.length).toFixed(1)
      : '0'
    const hwDone = results.filter((r) => r.homework_done === 'done').length
    const hwPercent = results.length > 0 ? Math.round((hwDone / results.length) * 100) : 0

    return { totalLessons, missed, totalTasks, totalCorrect, avgUnderstanding, hwPercent }
  }, [results, lessonPlans, activeStudent])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-accent" />
        Прогресс ученика
      </h1>

      {/* Табы */}
      <div className="flex gap-2">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStudent(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeStudent === s.id ? 'text-white' : 'bg-white border border-border text-text-secondary hover:border-gray-300'
            }`}
            style={activeStudent === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Сводная статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Уроков проведено" value={stats.totalLessons} sub={`пропущено: ${stats.missed}`} icon={BookOpen} />
        <StatCard label="Задач решено" value={stats.totalTasks} sub={`верно: ${stats.totalCorrect} (${stats.totalTasks > 0 ? Math.round(stats.totalCorrect / stats.totalTasks * 100) : 0}%)`} icon={Target} />
        <StatCard label="Ср. понимание" value={`${stats.avgUnderstanding}/5`} sub={understandingEmojis[Math.round(Number(stats.avgUnderstanding))]} icon={Award} />
        <StatCard label="Д/З выполнено" value={`${stats.hwPercent}%`} sub={`${results.filter(r => r.homework_done === 'done').length} из ${results.length}`} icon={BookOpen} />
      </div>

      {/* Графики */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* % верных */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">% верных ответов по урокам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={correctData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="percent" stroke={student?.color || '#2A9D8F'} strokeWidth={2} dot={{ r: 4 }} name="% верно" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Радар */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Навыки по разделам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Уровень" dataKey="value" stroke={student?.color || '#2A9D8F'} fill={student?.color || '#2A9D8F'} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Задачи по неделям */}
        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2">
          <h3 className="font-bold mb-4">Задачи по неделям</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="solved" fill="#CBD5E1" name="Решено" radius={[4, 4, 0, 0]} />
              <Bar dataKey="correct" fill={student?.color || '#2A9D8F'} name="Верно" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица всех уроков */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <h3 className="font-bold p-5 pb-0">Все уроки</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-text-secondary">Дата</th>
                <th className="text-left px-4 py-2 font-medium text-text-secondary">Тема</th>
                <th className="text-center px-4 py-2 font-medium text-text-secondary">Понимание</th>
                <th className="text-center px-4 py-2 font-medium text-text-secondary">Задачи</th>
                <th className="text-center px-4 py-2 font-medium text-text-secondary">% верно</th>
                <th className="text-center px-4 py-2 font-medium text-text-secondary">Д/З</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2">{format(parseISO(r.date), 'd MMM', { locale: ru })}</td>
                  <td className="px-4 py-2 font-medium">{r.topic}</td>
                  <td className="px-4 py-2 text-center text-lg">{understandingEmojis[r.understanding]}</td>
                  <td className="px-4 py-2 text-center">{r.tasks_correct}/{r.tasks_solved}</td>
                  <td className="px-4 py-2 text-center font-medium">{Math.round(r.tasks_correct / r.tasks_solved * 100)}%</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs font-medium ${
                      r.homework_done === 'done' ? 'text-success' :
                      r.homework_done === 'partial' ? 'text-warning' : 'text-danger'
                    }`}>
                      {hwLabels[r.homework_done]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub: string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-accent" />
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
    </div>
  )
}
