import { useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trophy, Clock, Plus, Save } from 'lucide-react'
import type { MockResult } from '@/types/database'

export default function OlympiadsPage() {
  const { students, olympiadEvents, mockResults, addMockResult } = useDataStore()
  const today = new Date()
  const [showForm, setShowForm] = useState(false)

  // Форма нового пробного результата
  const [formStudent, setFormStudent] = useState(students[0]?.id || '')
  const [formDate, setFormDate] = useState(format(today, 'yyyy-MM-dd'))
  const [formFormat, setFormFormat] = useState('FEMO Весенний')
  const [formScore, setFormScore] = useState(0)
  const [formMax, setFormMax] = useState(120)
  const [formTime, setFormTime] = useState(75)
  const [formComment, setFormComment] = useState('')

  const handleSaveMock = () => {
    const result: MockResult = {
      id: `mock-${Date.now()}`,
      student_id: formStudent,
      date: formDate,
      format: formFormat,
      score: formScore,
      max_score: formMax,
      time_min: formTime,
      comment: formComment,
    }
    addMockResult(result)
    setShowForm(false)
    setFormComment('')
    setFormScore(0)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Trophy className="w-6 h-6 text-accent" />
        Олимпиады
      </h1>

      {/* Обратный отсчёт */}
      <div className="grid md:grid-cols-2 gap-4">
        {olympiadEvents.map((evt) => {
          const daysLeft = differenceInDays(parseISO(evt.date), today)
          const isSpring = evt.date < '2026-06-01'
          return (
            <div
              key={evt.id}
              className={`rounded-2xl p-6 text-white ${isSpring ? 'bg-gradient-to-br from-accent to-accent-light' : 'bg-gradient-to-br from-marzhan to-marzhan-light'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <h2 className="font-bold text-lg">{evt.name}</h2>
              </div>
              <p className="text-white/80 text-sm mb-4">{evt.description}</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{daysLeft > 0 ? daysLeft : 0}</span>
                <span className="text-lg mb-1">дней</span>
              </div>
              <p className="text-sm text-white/80 mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {format(parseISO(evt.date), 'd MMMM yyyy', { locale: ru })}
              </p>

              {/* Готовность учеников */}
              <div className="mt-4 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {student.name[0]}
                    </div>
                    <span className="text-sm flex-1">{student.name}</span>
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-xs">6/10</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Пробные олимпиады */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Результаты пробных олимпиад</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={formStudent}
                onChange={(e) => setFormStudent(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl text-sm"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl text-sm" />
              <select value={formFormat} onChange={(e) => setFormFormat(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl text-sm">
                <option>FEMO Весенний</option>
                <option>FEMO Международный</option>
              </select>
              <div className="flex gap-2">
                <input type="number" value={formScore} onChange={(e) => setFormScore(Number(e.target.value))}
                  placeholder="Балл" className="w-20 px-3 py-2 border border-border rounded-xl text-sm" />
                <span className="self-center text-text-secondary">/</span>
                <input type="number" value={formMax} onChange={(e) => setFormMax(Number(e.target.value))}
                  placeholder="Макс" className="w-20 px-3 py-2 border border-border rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={formTime} onChange={(e) => setFormTime(Number(e.target.value))}
                placeholder="Время (мин)" className="px-3 py-2 border border-border rounded-xl text-sm" />
              <input type="text" value={formComment} onChange={(e) => setFormComment(e.target.value)}
                placeholder="Комментарий" className="px-3 py-2 border border-border rounded-xl text-sm" />
            </div>
            <button onClick={handleSaveMock}
              className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition">
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        )}

        {/* Таблица результатов */}
        {mockResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-text-secondary">Дата</th>
                  <th className="text-left px-4 py-2 font-medium text-text-secondary">Ученик</th>
                  <th className="text-left px-4 py-2 font-medium text-text-secondary">Формат</th>
                  <th className="text-center px-4 py-2 font-medium text-text-secondary">Баллы</th>
                  <th className="text-center px-4 py-2 font-medium text-text-secondary">%</th>
                  <th className="text-center px-4 py-2 font-medium text-text-secondary">Время</th>
                  <th className="text-left px-4 py-2 font-medium text-text-secondary">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {mockResults.map((mr) => {
                  const student = students.find((s) => s.id === mr.student_id)
                  return (
                    <tr key={mr.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2">{format(parseISO(mr.date), 'd MMM yyyy', { locale: ru })}</td>
                      <td className="px-4 py-2 font-medium">{student?.name}</td>
                      <td className="px-4 py-2">{mr.format}</td>
                      <td className="px-4 py-2 text-center font-medium">{mr.score}/{mr.max_score}</td>
                      <td className="px-4 py-2 text-center">{Math.round(mr.score / mr.max_score * 100)}%</td>
                      <td className="px-4 py-2 text-center">{mr.time_min} мин</td>
                      <td className="px-4 py-2 text-text-secondary">{mr.comment}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-8">
            Пока нет результатов пробных олимпиад. Нажмите «Добавить» чтобы записать первый.
          </p>
        )}
      </div>
    </div>
  )
}
