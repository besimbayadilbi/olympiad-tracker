import { useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClipboardList, Plus, Eye, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { Assignment, AssignmentTask, TaskType } from '@/types/database'

export default function AssignmentsPage() {
  const { students, assignments, assignmentTasks, studentSubmissions, addAssignment, addAssignmentTask } = useDataStore()
  const [activeStudent, setActiveStudent] = useState(students[0]?.id || '')
  const [showCreate, setShowCreate] = useState(false)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)

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

  const getTaskSubmissions = (taskId: string) => {
    return studentSubmissions.filter((s) => s.assignment_task_id === taskId)
  }

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
            const tasks = assignmentTasks.filter((t) => t.assignment_id === assignment.id)
            const expanded = expandedAssignment === assignment.id

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
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-text-secondary" />
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    {tasks.sort((a, b) => a.order_index - b.order_index).map((task) => {
                      const submissions = getTaskSubmissions(task.id)
                      const submission = submissions[0]

                      return (
                        <div key={task.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              task.task_type === 'multiple_choice' ? 'bg-accent/10 text-accent' :
                              task.task_type === 'short_answer' ? 'bg-primary/10 text-primary' :
                              'bg-warning/10 text-warning'
                            }`}>
                              {task.task_type === 'multiple_choice' ? 'Выбор' : task.task_type === 'short_answer' ? 'Ввод' : 'Фото'}
                            </span>
                            <span className="text-xs text-text-secondary">{task.points} б.</span>
                          </div>
                          <p className="text-sm">{task.question}</p>
                          <p className="text-xs text-text-secondary">Ответ: {task.correct_answer || '(проверка вручную)'}</p>

                          {submission ? (
                            <div className="flex items-center gap-2 mt-1">
                              {submission.is_correct === true ? (
                                <><CheckCircle className="w-4 h-4 text-success" /><span className="text-xs text-success">Верно: {submission.answer_text}</span></>
                              ) : submission.is_correct === false ? (
                                <><XCircle className="w-4 h-4 text-danger" /><span className="text-xs text-danger">Неверно: {submission.answer_text}</span></>
                              ) : (
                                <><Clock className="w-4 h-4 text-warning" /><span className="text-xs text-warning">Отправлено: {submission.answer_text}</span></>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-text-secondary italic">Не отвечено</p>
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
    </div>
  )
}
