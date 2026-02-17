import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarDays, ChevronDown, Edit3, Play, Check, X as XIcon, AlertTriangle, Trophy, BookOpen } from 'lucide-react'
import type { LessonPlan, LessonStatus, LessonCategory } from '@/types/database'

const statusConfig: Record<LessonStatus, { label: string; color: string; bg: string }> = {
  planned: { label: 'Запланирован', color: 'text-gray-600', bg: 'bg-gray-100' },
  completed: { label: 'Проведён', color: 'text-success', bg: 'bg-success/10' },
  missed: { label: 'Пропущен', color: 'text-danger', bg: 'bg-danger/10' },
  rescheduled: { label: 'Перенесён', color: 'text-warning', bg: 'bg-warning/10' },
}

export default function LessonPlanPage() {
  const { students, lessonPlans, updateLessonPlan } = useDataStore()
  const [activeStudent, setActiveStudent] = useState(students[0]?.id || '')
  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<LessonStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<LessonCategory | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<LessonPlan>>({})

  const filteredPlans = useMemo(() => {
    let plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    if (filterWeek !== 'all') plans = plans.filter((lp) => lp.week_number === filterWeek)
    if (filterStatus !== 'all') plans = plans.filter((lp) => lp.status === filterStatus)
    if (filterType !== 'all') plans = plans.filter((lp) => lp.lesson_type === filterType)
    return plans.sort((a, b) => a.order_index - b.order_index)
  }, [lessonPlans, activeStudent, filterWeek, filterStatus, filterType])

  const weeks = useMemo(() => {
    const plans = lessonPlans.filter((lp) => lp.student_id === activeStudent)
    return [...new Set(plans.map((lp) => lp.week_number))].sort((a, b) => a - b)
  }, [lessonPlans, activeStudent])

  const startEdit = (plan: LessonPlan) => {
    setEditingId(plan.id)
    setEditForm({ topic: plan.topic, source: plan.source, homework: plan.homework, status: plan.status })
  }

  const saveEdit = (id: string) => {
    updateLessonPlan(id, editForm)
    setEditingId(null)
  }

  const isKenguruPrep = (topic: string) =>
    topic.toLowerCase().includes('кенгуру') || topic.toLowerCase().includes('генеральная репетиция')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-accent" />
          Поурочный план
        </h1>
      </div>

      {/* Табы учеников */}
      <div className="flex gap-2">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStudent(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeStudent === s.id
                ? 'text-white'
                : 'bg-white border border-border text-text-secondary hover:border-gray-300'
            }`}
            style={activeStudent === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="appearance-none bg-white border border-border rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Все недели</option>
            {weeks.map((w) => (
              <option key={w} value={w}>Неделя {w}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LessonStatus | 'all')}
            className="appearance-none bg-white border border-border rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Все статусы</option>
            <option value="planned">Запланирован</option>
            <option value="completed">Проведён</option>
            <option value="missed">Пропущен</option>
            <option value="rescheduled">Перенесён</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as LessonCategory | 'all')}
            className="appearance-none bg-white border border-border rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Все типы</option>
            <option value="olympiad">🏆 Олимпиада</option>
            <option value="textbook">📚 Учебник</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-10">№</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-10">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-16">Нед.</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-24">Дата</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-12">День</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Тема урока</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Источник</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden xl:table-cell">Олимп. задачи</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Д/З</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-28">Статус</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan, idx) => {
                const isEditing = editingId === plan.id
                const isPrep = isKenguruPrep(plan.topic)
                const isOlympiad = plan.lesson_type === 'olympiad'
                return (
                  <tr
                    key={plan.id}
                    className={`border-b border-border last:border-0 hover:bg-gray-50 transition ${
                      isPrep ? 'bg-warning/5' : isOlympiad ? 'bg-accent/5' : 'bg-primary/5'
                    }`}
                  >
                    <td className="px-4 py-3 text-text-secondary">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {isOlympiad
                        ? <Trophy className="w-4 h-4 text-accent" />
                        : <BookOpen className="w-4 h-4 text-primary" />
                      }
                    </td>
                    <td className="px-4 py-3">{plan.week_number}</td>
                    <td className="px-4 py-3">
                      {format(parseISO(plan.date), 'd MMM', { locale: ru })}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{plan.day_label}</td>
                    <td className="px-4 py-3 font-medium">
                      {isEditing ? (
                        <input
                          value={editForm.topic || ''}
                          onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                          className="w-full px-2 py-1 border border-border rounded-lg text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {isPrep && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
                          {plan.topic}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {isEditing ? (
                        <input
                          value={editForm.source || ''}
                          onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                          className="w-full px-2 py-1 border border-border rounded-lg text-sm"
                        />
                      ) : plan.source}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden xl:table-cell">{plan.olympiad_tasks}</td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {isEditing ? (
                        <input
                          value={editForm.homework || ''}
                          onChange={(e) => setEditForm({ ...editForm, homework: e.target.value })}
                          className="w-full px-2 py-1 border border-border rounded-lg text-sm"
                        />
                      ) : plan.homework}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LessonStatus })}
                          className="px-2 py-1 border border-border rounded-lg text-sm"
                        >
                          {Object.entries(statusConfig).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[plan.status].bg} ${statusConfig[plan.status].color}`}>
                          {statusConfig[plan.status].label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(plan.id)} className="p-1 text-success hover:bg-success/10 rounded-lg">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-danger hover:bg-danger/10 rounded-lg">
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(plan)} className="p-1 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-lg">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {plan.status === 'planned' && (
                              <Link to={`/record/${plan.id}`} className="p-1 text-accent hover:bg-accent/10 rounded-lg">
                                <Play className="w-4 h-4" />
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 text-accent" />
          Олимпиада
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-primary" />
          Учебник
        </div>
        {Object.entries(statusConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${val.bg} border`}></span>
            {val.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-warning" />
          Подготовка к олимпиаде
        </div>
      </div>
    </div>
  )
}
