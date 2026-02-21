import { useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { BONUS_CONFIG } from '@/lib/seedData'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ClipboardList, Plus, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Star, Timer, Zap, RotateCcw, ShoppingBag
} from 'lucide-react'
import type { Assignment, AssignmentTask, TaskType } from '@/types/database'

export default function AssignmentsPage() {
  const {
    students, assignments, assignmentTasks, studentSubmissions,
    addAssignment, addAssignmentTask,
    getStudentPoints, getStudentAvailablePoints, getStudentLevel, getStudentBadges,
    rewardRedemptions,
  } = useDataStore()
  const [activeStudent, setActiveStudent] = useState(students[0]?.id || '')
  const [showCreate, setShowCreate] = useState(false)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'assignments' | 'overview'>('assignments')

  // Форма нового задания
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDueDate, setNewDueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newTasks, setNewTasks] = useState<Partial<AssignmentTask>[]>([
    { task_type: 'multiple_choice', question: '', correct_answer: '', points: 1, options: ['', '', '', ''] }
  ])

  const studentAssignments = assignments
    .filter((a) => a.student_id === activeStudent)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const studentSubs = studentSubmissions.filter((s) => s.student_id === activeStudent)

  const getTaskSubmissions = (taskId: string) => {
    return studentSubmissions.filter((s) => s.assignment_task_id === taskId && s.student_id === activeStudent)
  }

  // Stats
  const totalPoints = getStudentPoints(activeStudent)
  const availablePoints = getStudentAvailablePoints(activeStudent)
  const level = getStudentLevel(activeStudent)
  const badges = getStudentBadges(activeStudent)
  const totalTasks = assignmentTasks.filter((t) =>
    assignments.some((a) => a.id === t.assignment_id && a.student_id === activeStudent)
  )
  const correctTasks = totalTasks.filter((t) => studentSubs.some((s) => s.assignment_task_id === t.id && s.is_correct === true))
  const retryCount = studentSubs.filter((s) => s.is_retry).length
  const fastCount = studentSubs.filter((s) => s.time_spent_seconds && s.time_spent_seconds <= BONUS_CONFIG.speed_bonus_seconds && s.is_correct === true).length
  const studentRedemptions = rewardRedemptions.filter((r) => r.student_id === activeStudent)

  const handleCreateAssignment = () => {
    if (!newTitle.trim()) return

    const assignment: Assignment = {
      id: `assign-${Date.now()}`,
      student_id: activeStudent,
      title: newTitle,
      description: newDescription,
      due_date: newDueDate,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    addAssignment(assignment)

    newTasks.forEach((task, idx) => {
      if (!task.question?.trim()) return
      const assignmentTask: AssignmentTask = {
        id: `task-${Date.now()}-${idx}`,
        assignment_id: assignment.id,
        order_index: idx,
        task_type: task.task_type as TaskType,
        question: task.question || '',
        options: task.task_type === 'multiple_choice' ? task.options : undefined,
        correct_answer: task.correct_answer || '',
        points: task.points || 1,
      }
      addAssignmentTask(assignmentTask)
    })

    setShowCreate(false)
    setNewTitle('')
    setNewDescription('')
    setNewTasks([{ task_type: 'multiple_choice', question: '', correct_answer: '', points: 1, options: ['', '', '', ''] }])
  }

  const addNewTask = () => {
    setNewTasks([...newTasks, { task_type: 'multiple_choice', question: '', correct_answer: '', points: 1, options: ['', '', '', ''] }])
  }

  const updateNewTask = (idx: number, updates: Partial<AssignmentTask>) => {
    setNewTasks(newTasks.map((t, i) => i === idx ? { ...t, ...updates } : t))
  }

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-accent" />
          Задания
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      {/* Табы учеников */}
      <div className="flex gap-2">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStudent(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeStudent === s.id ? 'text-white' : 'bg-white border border-border text-text-secondary'
            }`}
            style={activeStudent === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Переключатель: задания / обзор */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'assignments' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'
          }`}
        >
          Задания и ответы
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'overview' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'
          }`}
        >
          Обзор ученика
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Статистика */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold text-accent">{totalPoints}</p>
              <p className="text-xs text-text-secondary">Баллов всего</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold text-success">{correctTasks.length}/{totalTasks.length}</p>
              <p className="text-xs text-text-secondary">Верных ответов</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{fastCount}</p>
              <p className="text-xs text-text-secondary flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Молний</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{retryCount}</p>
              <p className="text-xs text-text-secondary flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" /> Повторов</p>
            </div>
          </div>

          {/* Уровень */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{level.name}</p>
                  <p className="text-xs text-text-secondary">{totalPoints} баллов (доступно: {availablePoints})</p>
                </div>
              </div>
              {level.nextLevel && (
                <p className="text-xs text-accent font-medium">До «{level.nextLevel.name}»: {level.nextLevel.min_points - totalPoints} б.</p>
              )}
            </div>
          </div>

          {/* Бейджи */}
          {badges.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="font-bold text-sm mb-2">Достижения</h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => {
                  const info = BONUS_CONFIG.badges[badge.badge_type]
                  return (
                    <span key={badge.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/5 rounded-lg text-xs">
                      <span>{info?.emoji}</span>
                      <span className="font-medium">{info?.name}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Покупки в магазине */}
          {studentRedemptions.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-accent" /> Покупки в магазине
              </h3>
              <div className="space-y-1.5">
                {studentRedemptions.map((r) => {
                  const reward = BONUS_CONFIG.rewards.find((rw) => rw.id === r.reward_id)
                  return (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span>{reward?.emoji} {reward?.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">{format(parseISO(r.redeemed_at), 'd MMM', { locale: ru })}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          r.status === 'fulfilled' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {r.status === 'fulfilled' ? 'Выполнено' : 'Ожидает'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <>
          {/* Форма создания */}
          {showCreate && (
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h2 className="font-bold">Новое задание</h2>
              <input
                type="text"
                placeholder="Название задания"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="Описание"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl text-sm"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="px-4 py-2 border border-border rounded-xl text-sm"
              />

              <div className="space-y-3">
                <p className="font-medium text-sm">Задачи:</p>
                {newTasks.map((task, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">#{idx + 1}</span>
                      <select
                        value={task.task_type}
                        onChange={(e) => updateNewTask(idx, { task_type: e.target.value as TaskType })}
                        className="px-2 py-1 border border-border rounded-lg text-xs"
                      >
                        <option value="multiple_choice">Выбор ответа</option>
                        <option value="short_answer">Ввод ответа</option>
                        <option value="open_ended">С фото</option>
                      </select>
                      <input
                        type="number"
                        value={task.points || 1}
                        onChange={(e) => updateNewTask(idx, { points: Number(e.target.value) })}
                        className="w-16 px-2 py-1 border border-border rounded-lg text-xs"
                        min={1}
                      />
                      <span className="text-xs text-text-secondary">баллов</span>
                    </div>
                    <textarea
                      placeholder="Вопрос"
                      value={task.question || ''}
                      onChange={(e) => updateNewTask(idx, { question: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                      rows={2}
                    />
                    {task.task_type === 'multiple_choice' && (
                      <div className="grid grid-cols-2 gap-2">
                        {(task.options || ['', '', '', '']).map((opt, oi) => (
                          <input
                            key={oi}
                            placeholder={`Вариант ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={(e) => {
                              const opts = [...(task.options || ['', '', '', ''])]
                              opts[oi] = e.target.value
                              updateNewTask(idx, { options: opts })
                            }}
                            className="px-2 py-1 border border-border rounded-lg text-xs"
                          />
                        ))}
                      </div>
                    )}
                    {task.task_type !== 'open_ended' && (
                      <input
                        placeholder="Правильный ответ"
                        value={task.correct_answer || ''}
                        onChange={(e) => updateNewTask(idx, { correct_answer: e.target.value })}
                        className="w-full px-3 py-1 border border-border rounded-lg text-sm"
                      />
                    )}
                  </div>
                ))}
                <button onClick={addNewTask} className="text-accent text-sm font-medium hover:underline">
                  + Добавить задачу
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateAssignment}
                  className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition"
                >
                  Создать задание
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-gray-100 text-text-secondary rounded-xl text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Список заданий */}
          <div className="space-y-3">
            {studentAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center">
                <p className="text-text-secondary text-sm">Заданий пока нет</p>
              </div>
            ) : (
              studentAssignments.map((assignment) => {
                const tasks = assignmentTasks
                  .filter((t) => t.assignment_id === assignment.id)
                  .sort((a, b) => a.order_index - b.order_index)
                const expanded = expandedAssignment === assignment.id
                const answered = tasks.filter((t) => getTaskSubmissions(t.id).length > 0).length
                const correct = tasks.filter((t) => getTaskSubmissions(t.id).some((s) => s.is_correct === true)).length

                return (
                  <div key={assignment.id} className="bg-white rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedAssignment(expanded ? null : assignment.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">{assignment.title}</p>
                        <p className="text-xs text-text-secondary">
                          {tasks.length} задач • Срок: {format(parseISO(assignment.due_date), 'd MMM', { locale: ru })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium ${answered === tasks.length && tasks.length > 0 ? 'text-success' : 'text-warning'}`}>
                            {answered}/{tasks.length}
                          </span>
                          {correct === tasks.length && tasks.length > 0 && (
                            <span className="text-xs">💯</span>
                          )}
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-border p-4 space-y-3">
                        {tasks.map((task, idx) => {
                          const submissions = getTaskSubmissions(task.id)
                          const submission = submissions[0]

                          return (
                            <div key={task.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                              {/* Заголовок задачи */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-text-secondary">#{idx + 1}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    task.task_type === 'multiple_choice' ? 'bg-accent/10 text-accent' :
                                    task.task_type === 'short_answer' ? 'bg-primary/10 text-primary' :
                                    'bg-warning/10 text-warning'
                                  }`}>
                                    {task.task_type === 'multiple_choice' ? 'Выбор' : task.task_type === 'short_answer' ? 'Ввод' : 'Фото'}
                                  </span>
                                  <span className="text-xs text-text-secondary flex items-center gap-0.5">
                                    <Star className="w-3 h-3" />{task.points} б.
                                  </span>
                                </div>
                                {submission && (
                                  <div className="flex items-center gap-1.5">
                                    {submission.is_retry && (
                                      <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium flex items-center gap-0.5">
                                        <RotateCcw className="w-3 h-3" /> Retry
                                      </span>
                                    )}
                                    {submission.time_spent_seconds != null && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                                        submission.time_spent_seconds <= BONUS_CONFIG.speed_bonus_seconds
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-text-secondary'
                                      }`}>
                                        <Timer className="w-3 h-3" />
                                        {formatTime(submission.time_spent_seconds)}
                                        {submission.time_spent_seconds <= BONUS_CONFIG.speed_bonus_seconds && (
                                          <Zap className="w-3 h-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Вопрос */}
                              <p className="text-sm font-medium">{task.question}</p>

                              {/* Варианты (для multiple_choice) */}
                              {task.task_type === 'multiple_choice' && task.options && (
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                  {task.options.map((opt, i) => {
                                    const isCorrect = opt === task.correct_answer
                                    const isStudentAnswer = submission?.answer_text === opt
                                    return (
                                      <div
                                        key={i}
                                        className={`px-2 py-1.5 rounded-lg border ${
                                          isCorrect
                                            ? 'border-success bg-success/10 text-success font-medium'
                                            : isStudentAnswer && !isCorrect
                                            ? 'border-danger bg-danger/10 text-danger'
                                            : 'border-gray-200 text-text-secondary'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + i)}. {opt}
                                        {isCorrect && ' ✓'}
                                        {isStudentAnswer && !isCorrect && ' ✗'}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Правильный ответ */}
                              <div className="flex items-center gap-1.5 text-xs">
                                <CheckCircle className="w-3.5 h-3.5 text-success" />
                                <span className="text-success font-medium">Правильный ответ:</span>
                                <span className="font-medium">{task.correct_answer || '(проверка вручную)'}</span>
                              </div>

                              {/* Ответ ученика */}
                              {submission ? (
                                <div className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${
                                  submission.is_correct === true ? 'bg-success/10' :
                                  submission.is_correct === false ? 'bg-danger/10' : 'bg-warning/10'
                                }`}>
                                  {submission.is_correct === true ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                                  ) : submission.is_correct === false ? (
                                    <XCircle className="w-3.5 h-3.5 text-danger" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 text-warning" />
                                  )}
                                  <span className="font-medium">
                                    {submission.is_correct === true ? 'Верно' : submission.is_correct === false ? 'Неверно' : 'На проверке'}:
                                  </span>
                                  <span>{submission.answer_text}</span>
                                </div>
                              ) : (
                                <p className="text-xs text-text-secondary italic bg-gray-100 px-2.5 py-1.5 rounded-lg">
                                  Ещё не отвечено
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
