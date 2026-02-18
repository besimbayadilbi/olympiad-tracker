import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { BONUS_CONFIG } from '@/lib/seedData'
import { ArrowLeft, CheckCircle, XCircle, Camera, Send, Clock, Star } from 'lucide-react'
import type { AssignmentTask, StudentSubmission } from '@/types/database'

export default function StudentTaskPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const studentId = useAuthStore((s) => s.studentId)
  const { assignments, assignmentTasks, studentSubmissions, addSubmission } = useDataStore()
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string; pointsEarned: number } | null>(null)

  const assignment = assignments.find((a) => a.id === assignmentId)
  const tasks = assignmentTasks
    .filter((t) => t.assignment_id === assignmentId)
    .sort((a, b) => a.order_index - b.order_index)

  const currentTask = tasks[currentTaskIdx]

  const getSubmission = (taskId: string): StudentSubmission | undefined => {
    return studentSubmissions.find((s) => s.assignment_task_id === taskId && s.student_id === studentId)
  }

  const handleSubmit = (task: AssignmentTask) => {
    const answer = task.task_type === 'multiple_choice' ? selectedOption : textAnswer
    if (!answer || !studentId) return

    const isCorrect = task.task_type !== 'open_ended'
      ? answer.trim().toLowerCase() === task.correct_answer.trim().toLowerCase()
      : undefined

    const submission: StudentSubmission = {
      id: `sub-${Date.now()}`,
      assignment_task_id: task.id,
      student_id: studentId,
      answer_text: answer,
      is_correct: isCorrect,
      submitted_at: new Date().toISOString(),
    }

    addSubmission(submission)

    const earned = isCorrect === true
      ? BONUS_CONFIG.points_per_correct
      : isCorrect === false
      ? BONUS_CONFIG.points_per_attempt
      : BONUS_CONFIG.points_per_open_ended

    setFeedback({
      correct: isCorrect ?? true,
      answer: task.correct_answer,
      pointsEarned: earned,
    })
    setSelectedOption(null)
    setTextAnswer('')
  }

  const handlePhotoUpload = (task: AssignmentTask) => {
    if (!studentId) return
    const submission: StudentSubmission = {
      id: `sub-${Date.now()}`,
      assignment_task_id: task.id,
      student_id: studentId,
      answer_text: textAnswer || 'Фото решения загружено',
      answer_image_url: 'photo-placeholder.jpg',
      is_correct: undefined,
      submitted_at: new Date().toISOString(),
    }
    addSubmission(submission)
    setFeedback({
      correct: true,
      answer: 'Решение отправлено на проверку учителю',
      pointsEarned: BONUS_CONFIG.points_per_open_ended,
    })
    setTextAnswer('')
  }

  const goNext = () => {
    if (currentTaskIdx < tasks.length - 1) {
      setCurrentTaskIdx(currentTaskIdx + 1)
      setFeedback(null)
    }
  }

  const goPrev = () => {
    if (currentTaskIdx > 0) {
      setCurrentTaskIdx(currentTaskIdx - 1)
      setFeedback(null)
    }
  }

  if (!assignment || !currentTask) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Задание не найдено</p>
        <Link to="/student" className="text-accent text-sm mt-2 inline-block">Назад</Link>
      </div>
    )
  }

  const existingSubmission = getSubmission(currentTask.id)
  const completedCount = tasks.filter((t) => getSubmission(t.id)).length

  return (
    <div className="space-y-4">
      {/* Хедер */}
      <div className="flex items-center gap-3">
        <Link to="/student" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate">{assignment.title}</h1>
          <p className="text-xs text-text-secondary">
            Задача {currentTaskIdx + 1} из {tasks.length} • Выполнено: {completedCount}/{tasks.length}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 rounded-lg">
          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
          <span className="text-xs font-bold text-accent">{currentTask.points} б.</span>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="flex gap-1">
        {tasks.map((task, idx) => {
          const sub = getSubmission(task.id)
          return (
            <button
              key={task.id}
              onClick={() => { setCurrentTaskIdx(idx); setFeedback(null) }}
              className={`h-2 flex-1 rounded-full transition ${
                sub
                  ? sub.is_correct === true ? 'bg-success' : sub.is_correct === false ? 'bg-danger' : 'bg-warning'
                  : idx === currentTaskIdx ? 'bg-accent' : 'bg-gray-200'
              }`}
            />
          )
        })}
      </div>

      {/* Задача */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
            currentTask.task_type === 'multiple_choice' ? 'bg-accent/10 text-accent' :
            currentTask.task_type === 'short_answer' ? 'bg-primary/10 text-primary' :
            'bg-warning/10 text-warning'
          }`}>
            {currentTask.task_type === 'multiple_choice' ? 'Выбери ответ' :
             currentTask.task_type === 'short_answer' ? 'Впиши ответ' : 'Решение с фото'}
          </span>
          <span className="text-xs text-text-secondary">{currentTask.points} б.</span>
        </div>

        <p className="font-medium mt-3 mb-4 text-base leading-relaxed">{currentTask.question}</p>

        {/* Если уже отвечали */}
        {existingSubmission && !feedback ? (
          <div className={`rounded-xl p-3 ${
            existingSubmission.is_correct === true ? 'bg-success/10' :
            existingSubmission.is_correct === false ? 'bg-danger/10' :
            'bg-warning/10'
          }`}>
            <div className="flex items-center gap-2">
              {existingSubmission.is_correct === true ? (
                <><CheckCircle className="w-5 h-5 text-success" /><span className="font-medium text-success">Верно! +{BONUS_CONFIG.points_per_correct} б.</span></>
              ) : existingSubmission.is_correct === false ? (
                <><XCircle className="w-5 h-5 text-danger" /><span className="font-medium text-danger">Неверно (+{BONUS_CONFIG.points_per_attempt} за попытку)</span></>
              ) : (
                <><Clock className="w-5 h-5 text-warning" /><span className="font-medium text-warning">Отправлено (+{BONUS_CONFIG.points_per_open_ended} б.)</span></>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-1">Твой ответ: {existingSubmission.answer_text}</p>
            {existingSubmission.is_correct === false && (
              <p className="text-sm text-text-secondary mt-1">Правильный ответ: {currentTask.correct_answer}</p>
            )}
          </div>
        ) : !existingSubmission ? (
          <>
            {/* Варианты ответа (multiple_choice) */}
            {currentTask.task_type === 'multiple_choice' && currentTask.options && (
              <div className="space-y-2">
                {currentTask.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition text-sm ${
                      selectedOption === option
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                ))}
                <button
                  onClick={() => handleSubmit(currentTask)}
                  disabled={!selectedOption}
                  className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50"
                >
                  Ответить
                </button>
              </div>
            )}

            {/* Короткий ответ (short_answer) */}
            {currentTask.task_type === 'short_answer' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(currentTask)}
                  placeholder="Введи ответ..."
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => handleSubmit(currentTask)}
                  disabled={!textAnswer.trim()}
                  className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Ответить
                </button>
              </div>
            )}

            {/* Открытое задание с фото (open_ended) */}
            {currentTask.task_type === 'open_ended' && (
              <div className="space-y-3">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Опиши решение (можно кратко)..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-accent resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePhotoUpload(currentTask)}
                    className="flex-1 py-3 bg-gray-100 text-text rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Загрузить фото
                  </button>
                  <button
                    onClick={() => handlePhotoUpload(currentTask)}
                    disabled={!textAnswer.trim()}
                    className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Отправить
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Фидбек после ответа с баллами */}
        {feedback && (
          <div className={`rounded-xl p-3 mt-3 ${feedback.correct ? 'bg-success/10' : 'bg-danger/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feedback.correct ? (
                  <><CheckCircle className="w-5 h-5 text-success" /><span className="font-medium text-success">Верно!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-danger" /><span className="font-medium text-danger">Неверно</span></>
                )}
              </div>
              <span className={`text-sm font-bold flex items-center gap-1 ${feedback.correct ? 'text-success' : 'text-warning'}`}>
                <Star className="w-4 h-4 fill-current" />
                +{feedback.pointsEarned}
              </span>
            </div>
            {!feedback.correct && feedback.answer && feedback.answer !== 'Решение отправлено на проверку учителю' && (
              <p className="text-sm text-text-secondary mt-1">Правильный ответ: {feedback.answer}</p>
            )}
            {feedback.answer === 'Решение отправлено на проверку учителю' && (
              <p className="text-sm text-text-secondary mt-1">Решение отправлено на проверку учителю</p>
            )}
          </div>
        )}
      </div>

      {/* Навигация */}
      <div className="flex justify-between">
        <button
          onClick={goPrev}
          disabled={currentTaskIdx === 0}
          className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
        >
          Назад
        </button>
        {currentTaskIdx < tasks.length - 1 ? (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition"
          >
            Далее
          </button>
        ) : (
          <Link
            to="/student"
            className="px-4 py-2 bg-success text-white rounded-xl text-sm font-medium hover:bg-success/90 transition"
          >
            Завершить
          </Link>
        )}
      </div>
    </div>
  )
}
