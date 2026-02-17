import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { format } from 'date-fns'
import { PenSquare, Save, Sparkles, Loader2 } from 'lucide-react'
import { autoFillLessonResult, isAIConfigured } from '@/lib/ai'
import type { LessonResult, HomeworkStatus } from '@/types/database'

const understandingEmojis = ['\u{1F61F}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}']

export default function LessonRecordPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { students, lessonPlans, addLessonResult } = useDataStore()

  const plan = planId ? lessonPlans.find((lp) => lp.id === planId) : null
  const [studentId, setStudentId] = useState(plan?.student_id || students[0]?.id || '')
  const [date, setDate] = useState(plan?.date || format(new Date(), 'yyyy-MM-dd'))
  const [topic, setTopic] = useState(plan?.topic || '')
  const [understanding, setUnderstanding] = useState(3)
  const [tasksSolved, setTasksSolved] = useState(10)
  const [tasksCorrect, setTasksCorrect] = useState(7)
  const [homeworkGiven, setHomeworkGiven] = useState(plan?.homework || '')
  const [homeworkDone, setHomeworkDone] = useState<HomeworkStatus>('done')
  const [privateComment, setPrivateComment] = useState('')
  const [parentComment, setParentComment] = useState('')
  const [saved, setSaved] = useState(false)

  // AI auto-fill
  const [aiBrief, setAiBrief] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const aiReady = isAIConfigured()

  const correctPercent = tasksSolved > 0 ? Math.round((tasksCorrect / tasksSolved) * 100) : 0
  const student = students.find((s) => s.id === studentId)

  const handleAIFill = async () => {
    if (!aiBrief.trim() || !student) return
    setAiLoading(true)
    setAiError(null)
    try {
      const result = await autoFillLessonResult({
        studentName: student.name,
        grade: student.grade,
        topic,
        briefNote: aiBrief,
      })
      setUnderstanding(result.understanding)
      setTasksSolved(result.tasks_solved)
      setTasksCorrect(result.tasks_correct)
      setHomeworkGiven(result.homework_given)
      setPrivateComment(result.teacher_comment_private)
      setParentComment(result.teacher_comment_parent)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Ошибка ИИ')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = () => {
    const result: LessonResult = {
      id: `lr-${Date.now()}`,
      student_id: studentId,
      lesson_plan_id: plan?.id,
      date,
      topic,
      understanding,
      tasks_solved: tasksSolved,
      tasks_correct: tasksCorrect,
      homework_given: homeworkGiven,
      homework_done: homeworkDone,
      teacher_comment_private: privateComment,
      teacher_comment_parent: parentComment,
      created_at: new Date().toISOString(),
    }
    addLessonResult(result)
    setSaved(true)
    setTimeout(() => navigate('/'), 1500)
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-success">Урок сохранён!</h2>
          <p className="text-text-secondary mt-1">Перенаправляем на дашборд...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <PenSquare className="w-6 h-6 text-accent" />
        Запись урока
      </h1>

      {/* AI автозаполнение */}
      {aiReady && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Автозаполнение (ИИ)
          </h3>
          <p className="text-xs text-text-secondary">
            Напишите кратко, как прошёл урок, и ИИ заполнит форму за вас.
          </p>
          <textarea
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            rows={3}
            placeholder="Напр: Решали задачи на логику, Маржан справилась с 8 из 10, задала доделать стр 45."
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            onClick={handleAIFill}
            disabled={aiLoading || !aiBrief.trim()}
            className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? 'Заполняю...' : 'Заполнить форму'}
          </button>
          {aiError && <p className="text-xs text-danger">{aiError}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        {/* Ученик и дата */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ученик</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.grade} кл)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Тема урока</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="Тема урока"
          />
        </div>

        {/* Понимание */}
        <div>
          <label className="block text-sm font-medium mb-2">Понимание темы</label>
          <div className="flex gap-2">
            {understandingEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setUnderstanding(i + 1)}
                className={`w-12 h-12 text-2xl rounded-xl border-2 transition flex items-center justify-center ${
                  understanding === i + 1
                    ? 'border-accent bg-accent/10 scale-110'
                    : 'border-border hover:border-gray-300'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Задачи */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Решено задач</label>
            <input
              type="number"
              min={0}
              value={tasksSolved}
              onChange={(e) => setTasksSolved(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Из них верно</label>
            <input
              type="number"
              min={0}
              max={tasksSolved}
              value={tasksCorrect}
              onChange={(e) => setTasksCorrect(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">% верно</label>
            <div className="px-4 py-2.5 border border-border rounded-xl text-sm bg-gray-50 font-bold text-accent">
              {correctPercent}%
            </div>
          </div>
        </div>

        {/* Д/З */}
        <div>
          <label className="block text-sm font-medium mb-1">Д/З задано</label>
          <input
            type="text"
            value={homeworkGiven}
            onChange={(e) => setHomeworkGiven(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="Что задано на дом"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Д/З прошлого урока</label>
          <div className="flex gap-2">
            {[
              { value: 'done' as const, label: 'Сделано', color: 'success' },
              { value: 'partial' as const, label: 'Частично', color: 'warning' },
              { value: 'not_done' as const, label: 'Нет', color: 'danger' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHomeworkDone(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border-2 ${
                  homeworkDone === opt.value
                    ? `border-${opt.color} bg-${opt.color}/10 text-${opt.color}`
                    : 'border-border text-text-secondary hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Комментарии */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Заметка для себя
          </label>
          <textarea
            value={privateComment}
            onChange={(e) => setPrivateComment(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            placeholder="Заметки для себя..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Комментарий для мамы
          </label>
          <textarea
            value={parentComment}
            onChange={(e) => setParentComment(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            placeholder="Что сообщить маме..."
          />
        </div>

        {/* Сохранить */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Сохранить урок
        </button>
      </div>
    </div>
  )
}
