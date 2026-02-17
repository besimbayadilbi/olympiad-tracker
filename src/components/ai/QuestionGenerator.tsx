import { useState } from 'react'
import { generateQuestions, isAIConfigured } from '@/lib/ai'
import { useDataStore } from '@/store/dataStore'
import { Sparkles, Loader2, AlertCircle, Plus, Check } from 'lucide-react'
import type { AssignmentTask, TaskType } from '@/types/database'

interface Props {
  assignmentId: string
  onTasksGenerated?: (tasks: AssignmentTask[]) => void
}

export default function QuestionGenerator({ assignmentId, onTasksGenerated }: Props) {
  const { addAssignmentTask, assignmentTasks } = useDataStore()
  const [topic, setTopic] = useState('')
  const [grade, setGrade] = useState(4)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [taskType, setTaskType] = useState<TaskType>('multiple_choice')
  const [count, setCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<AssignmentTask[]>([])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const aiReady = isAIConfigured()

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setGenerated([])

    try {
      const questions = await generateQuestions({ topic, grade, difficulty, count, type: taskType })
      const existingCount = assignmentTasks.filter((t) => t.assignment_id === assignmentId).length

      const tasks: AssignmentTask[] = questions.map((q, idx) => ({
        id: `ai-task-${Date.now()}-${idx}`,
        assignment_id: assignmentId,
        order_index: existingCount + idx,
        task_type: taskType,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points,
      }))

      setGenerated(tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = (task: AssignmentTask) => {
    addAssignmentTask(task)
    setAddedIds(new Set([...addedIds, task.id]))
    onTasksGenerated?.([task])
  }

  const handleAddAll = () => {
    const toAdd = generated.filter((t) => !addedIds.has(t.id))
    toAdd.forEach((task) => addAssignmentTask(task))
    setAddedIds(new Set([...addedIds, ...toAdd.map((t) => t.id)]))
    onTasksGenerated?.(toAdd)
  }

  if (!aiReady) {
    return (
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-warning">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">ИИ не настроен</span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Добавьте VITE_ANTHROPIC_API_KEY в файл .env для генерации задач.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-3">
      <h3 className="font-bold text-sm flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        Генерация задач (ИИ)
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Тема (напр. Логика)"
          className="col-span-2 sm:col-span-1 px-3 py-2 border border-border rounded-lg text-sm"
        />
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="px-2 py-2 border border-border rounded-lg text-sm"
        >
          <option value={4}>4 класс</option>
          <option value={5}>5 класс</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="px-2 py-2 border border-border rounded-lg text-sm"
        >
          <option value="easy">Лёгкий</option>
          <option value="medium">Средний</option>
          <option value="hard">Сложный</option>
        </select>
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as TaskType)}
          className="px-2 py-2 border border-border rounded-lg text-sm"
        >
          <option value="multiple_choice">Выбор</option>
          <option value="short_answer">Ввод</option>
          <option value="open_ended">Развёрнутый</option>
        </select>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-2 py-2 border border-border rounded-lg text-sm"
        >
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>{n} задач</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="w-full py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Генерируем...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Сгенерировать</>
        )}
      </button>

      {error && (
        <div className="bg-danger/10 text-danger rounded-lg p-2 text-xs">{error}</div>
      )}

      {generated.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">Сгенерировано: {generated.length}</p>
            <button
              onClick={handleAddAll}
              className="text-xs text-accent font-medium hover:underline"
            >
              Добавить все
            </button>
          </div>
          {generated.map((task) => (
            <div key={task.id} className="bg-white rounded-lg p-3 text-sm border border-border">
              <p className="font-medium">{task.question}</p>
              {task.options && (
                <div className="mt-1 text-xs text-text-secondary space-y-0.5">
                  {task.options.map((o, i) => (
                    <p key={i}>{String.fromCharCode(65 + i)}. {o}</p>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-secondary">Ответ: {task.correct_answer}</span>
                <button
                  onClick={() => handleAddTask(task)}
                  disabled={addedIds.has(task.id)}
                  className="flex items-center gap-1 text-xs font-medium text-accent disabled:text-success"
                >
                  {addedIds.has(task.id) ? <><Check className="w-3 h-3" /> Добавлено</> : <><Plus className="w-3 h-3" /> Добавить</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
