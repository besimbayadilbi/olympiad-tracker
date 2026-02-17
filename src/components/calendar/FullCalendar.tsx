import { useState, useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, isSameDay,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LessonDayModal from './LessonDayModal'
import type { LessonPlan } from '@/types/database'

export default function FullCalendar() {
  const { students, lessonPlans, lessonResults } = useDataStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const getLessonsForDay = (day: Date): LessonPlan[] => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return lessonPlans.filter((lp) => lp.date === dayStr)
  }

  const selectedDayLessons = selectedDay ? getLessonsForDay(selectedDay) : []
  const selectedDayResults = selectedDay
    ? lessonResults.filter((r) => r.date === format(selectedDay, 'yyyy-MM-dd'))
    : []

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg capitalize">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Заголовки дней */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-text-secondary py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Ячейки календаря */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const lessons = getLessonsForDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const current = isToday(day)
          const selected = selectedDay && isSameDay(day, selectedDay)

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`relative min-h-[70px] sm:min-h-[80px] p-1 rounded-xl text-left transition border-2 ${
                selected
                  ? 'border-accent bg-accent/5'
                  : current
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-transparent hover:bg-gray-50'
              } ${!inMonth ? 'opacity-30' : ''}`}
            >
              <span className={`text-xs font-medium ${current ? 'text-accent' : 'text-text-secondary'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {lessons.slice(0, 3).map((lesson) => {
                  const student = students.find((s) => s.id === lesson.student_id)
                  return (
                    <div
                      key={lesson.id}
                      className={`text-[9px] sm:text-[10px] leading-tight px-1 py-0.5 rounded font-medium truncate text-white ${
                        lesson.status === 'completed' ? 'opacity-70' : ''
                      }`}
                      style={{ backgroundColor: lesson.lesson_type === 'olympiad' ? (student?.color || '#888') : '#1B3A5C' }}
                    >
                      <span className="hidden sm:inline">{student?.name}: </span>
                      <span className="sm:hidden">{student?.name[0]} </span>
                      {lesson.lesson_type === 'textbook' ? '📚' : '🏆'}
                    </div>
                  )
                })}
                {lessons.length > 3 && (
                  <span className="text-[9px] text-text-secondary">+{lessons.length - 3}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-text-secondary">
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary" />
          Учебник
        </div>
      </div>

      {/* Модалка выбранного дня */}
      {selectedDay && selectedDayLessons.length > 0 && (
        <LessonDayModal
          date={selectedDay}
          lessons={selectedDayLessons}
          results={selectedDayResults}
          students={students}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
