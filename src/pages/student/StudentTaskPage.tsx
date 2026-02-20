import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { BONUS_CONFIG } from '@/lib/seedData'
import { ArrowLeft, CheckCircle, XCircle, Camera, Send, Clock, Star, Zap, RotateCcw, Timer } from 'lucide-react'
import type { AssignmentTask, StudentSubmission } from '@/types/database'

export default function StudentTaskPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const studentId = useAuthStore((s) => s.studentId)
  const { assignments, assignmentTasks, studentSubmissions, addSubmission, retrySubmission } = useDataStore()
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string; pointsEarned: number; fast?: boolean } | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Timer
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const assignment = assignments.find((a) => a.id === assignmentId)
  const tasks = assignmentTasks
    .filter((t) => t.assignment_id === assignmentId)
    .sort((a, b) => a.order_index - b.order_index)

  const currentTask = tasks[currentTaskIdx]

  const getSubmission = (taskId: string): StudentSubmission | undefined => {
    return studentSubmissions.find((s) => s.assignment_task_id === taskId && s.student_id === studentId)
  }

  // Запускаем таймер при смене задачи
  useEffect(() => {
    const sub = currentTask ? getSubmission(currentTask.id) : undefined
    if (currentTask && !sub && !feedback) {
      startTimeRef.current = Date.now()
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTaskIdx, isRetrying])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleSubmit = (task: AssignmentTask) => {
    const answer = task.task_type === 'multiple_choice' ? selectedOption : textAnswer
    if (!answer || !studentId) return

    const timeSpent = stopTimer()
    const isFast = timeSpent <= BONUS_CONFIG.speed_bonus_seconds

    const isCorrect = task.task_type !== 'open_ended'
      ? answer.trim().toLowerCase() === task.correct_answer.trim().toLowerCase()
      : undefined

    const submission: StudentSubmission = {
      id: `sub-${Date.now()}`,
      assignment_task_id: task.id,
      student_id: studentId,
      answer_text: answer,
      is_correct: isCorrect,
      is_retry: isRetrying,
      time_spent_seconds: timeSpent,
      submitted_at: new Date().toISOString(),
    }

    addSubmission(submission)

    let earned = 0
    if (isCorrect === true) {
      earned = isRetrying ? BONUS_CONFIG.points_per_retry : BONUS_CONFIG.points_per_correct
    } else if (isCorrect === false) {
      earned = BONUS_CONFIG.points_per_attempt
    } else {
      earned = BONUS_CONFIG.points_per_open_ended
    }

    setFeedback({
      correct: isCorrect ?? true,
      answer: task.correct_answer,
      pointsEarned: earned,
      fast: isFast && isCorrect === true,
    })
    setSelectedOption(null)
    setTextAnswer('')
    setIsRetrying(false)
  }

  const handleRetry = (task: AssignmentTask) => {
    if (!studentId) return
    retrySubmission(task.id, studentId)
    setIsRetrying(true)
    setFeedback(null)
    startTimeRef.current = Date.now()
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const handlePhotoUpload = (task: AssignmentTask) => {
    if (!studentId) return
    const timeSpent = stopTimer()
    const submission: StudentSubmission = {
      id: `sub-${Date.now()}`,
      assignment_task_id: task.id,
      student_id: studentId,
      answer_text: textAnswer || 'Фото решения загружено',
      answer_image_url: 'photo-placeholder.jpg',
      is_correct: undefined,
      time_spent_seconds: timeSpent,
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
      setIsRetrying(false)
    }
  }

  const goPrev = () => {
    if (currentTaskIdx > 0) {
      setCurrentTaskIdx(currentTaskIdx - 1)
      setFeedback(null)
      setIsRetrying(false)
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
  const showInput = !existingSubmission || isRetrying

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
        <div className="flex items-center gap-2">
          {/* Таймер */}
          {showInput && !feedback && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
              elapsed <= BONUS_CONFIG.speed_bonus_seconds ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-text-secondary'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-bold">{formatTime(elapsed)}</span>
              {elapsed <= BONUS_CONFIG.speed_bonus_seconds && <Zap className="w-3 h-3 text-yellow-500" />}
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 rounded-lg">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-xs font-bold text-accent">
              {isRetrying ? BONUS_CONFIG.points_per_retry : currentTask.points} б.
            </span>
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="flex gap-1">
        {tasks.map((task, idx) => {
          const sub = getSubmission(task.id)
          return (
            <button
              key={task.id}
              onClick={() => { setCurrentTaskIdx(idx); setFeedback(null); setIsRetrying(false) }}
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
          {isRetrying && (
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-yellow-100 text-yellow-700">
              Повторная попытка (+{BONUS_CONFIG.points_per_retry} б.)
            </span>
          )}
        </div>

        <p className="font-medium mt-3 mb-4 text-base leading-relaxed">{currentTask.question}</p>

        {/* Если уже отвечали и не делаем retry */}
        {existingSubmission && !feedback && !isRetrying ? (
          <div className={`rounded-xl p-3 ${
            existingSubmission.is_correct === true ? 'bg-success/10' :
            existingSubmission.is_correct === false ? 'bg-danger/10' :
            'bg-warning/10'
          }`}>
            <div className="flex items-center gap-2">
              {existingSubmission.is_correct === true ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">
                    Верно! +{existingSubmission.is_retry ? BONUS_CONFIG.points_per_retry : BONUS_CONFIG.points_per_correct} б.
                  </span>
                  {existingSubmission.time_spent_seconds && existingSubmission.time_spent_seconds <= BONUS_CONFIG.speed_bonus_seconds && (
                    <span className="ml-1 flex items-center gap-0.5 text-yellow-600 text-xs font-medium">
                      <Zap className="w-3.5 h-3.5" /> Молния!
                    </span>
                  )}
                </>
              ) : existingSubmission.is_correct === false ? (
                <>
                  <XCircle className="w-5 h-5 text-danger" />
                  <span className="font-medium text-danger">Неверно (+{BONUS_CONFIG.points_per_attempt} за попытку)</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">Отправлено (+{BONUS_CONFIG.points_per_open_ended} б.)</span>
                </>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-1">Твой ответ: {existingSubmission.answer_text}</p>
            {existingSubmission.time_spent_seconds != null && (
              <p className="text-xs text-text-secondary mt-0.5">Время: {formatTime(existingSubmission.time_spent_seconds)}</p>
            )}
            {existingSubmission.is_correct === false && (
              <>
                <p className="text-sm text-text-secondary mt-1">Правильный ответ: {currentTask.correct_answer}</p>
                {/* Кнопка повторной попытки */}
                <button
                  onClick={() => handleRetry(currentTask)}
                  className="mt-3 w-full py-2.5 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Попробовать снова (+{BONUS_CONFIG.points_per_retry} б. за верный)
                </button>
              </>
            )}
          </div>
        ) : showInput && !feedback ? (
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
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Верно!</span>
                    {feedback.fast && (
                      <span className="flex items-center gap-0.5 text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-0.5 rounded-lg">
                        <Zap className="w-3.5 h-3.5" /> Молния!
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-danger" />
                    <span className="font-medium text-danger">Неверно</span>
                  </>
                )}
              </div>
              <span className={`text-sm font-bold flex items-center gap-1 ${feedback.correct ? 'text-success' : 'text-warning'}`}>
                <Star className="w-4 h-4 fill-current" />
                +{feedback.pointsEarned}
              </span>
            </div>
            {!feedback.correct && feedback.answer && feedback.answer !== 'Решение отправлено на проверку учителю' && (
              <>
                <p className="text-sm text-text-secondary mt-1">Правильный ответ: {feedback.answer}</p>
                {/* Кнопка повторной попытки из фидбека */}
                {currentTask.task_type !== 'open_ended' && (
                  <button
                    onClick={() => handleRetry(currentTask)}
                    className="mt-3 w-full py-2.5 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Попробовать снова (+{BONUS_CONFIG.points_per_retry} б. за верный)
                  </button>
                )}
              </>
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
