import type {
  Student, Schedule, LessonPlan, KnowledgeBase,
  OlympiadEvent, LessonResult, WeeklyReport, Assignment, AssignmentTask,
  LessonCategory, Resource, StudentBadge,
} from '@/types/database'

// === УЧЕНИКИ ===
export const seedStudents: Student[] = [
  {
    id: 'student-marzhan',
    name: 'Маржан',
    grade: 4,
    textbook: 'Петерсон 4 класс',
    color: '#7B2D8E',
    access_token: 'marzhan-2026',
  },
  {
    id: 'student-batyrkhan',
    name: 'Батырхан',
    grade: 5,
    textbook: 'Дорофеев 5 класс',
    color: '#2E5D8A',
    access_token: 'batyrkhan-2026',
  },
]

// === РАСПИСАНИЕ ===
// Февраль: только Сб + Вс (оба ученика)
// С марта:
//   Маржан: Ср + Пт + Сб + Вс (4 урока/нед)
//   Батырхан: Пн + Ср + Сб + Вс (4 урока/нед)
// Маржан: 9:30 выходные / 15:00 будни
// Батырхан: 13:00 выходные / 20:00 будни
export const seedSchedule: Schedule[] = [
  // Маржан — выходные (постоянные)
  { id: 's1', student_id: 'student-marzhan', day_of_week: 6, time: '09:30', lesson_type: 'olympiad' },
  { id: 's2', student_id: 'student-marzhan', day_of_week: 0, time: '09:30', lesson_type: 'olympiad' },
  // Маржан — будни (с марта): Ср, Пт
  { id: 's3', student_id: 'student-marzhan', day_of_week: 3, time: '15:00', lesson_type: 'olympiad' },
  { id: 's4', student_id: 'student-marzhan', day_of_week: 5, time: '15:00', lesson_type: 'olympiad' },
  // Батырхан — выходные (постоянные)
  { id: 's5', student_id: 'student-batyrkhan', day_of_week: 6, time: '13:00', lesson_type: 'olympiad' },
  { id: 's6', student_id: 'student-batyrkhan', day_of_week: 0, time: '13:00', lesson_type: 'olympiad' },
  // Батырхан — будни (с марта): Пн, Ср
  { id: 's7', student_id: 'student-batyrkhan', day_of_week: 1, time: '20:00', lesson_type: 'olympiad' },
  { id: 's8', student_id: 'student-batyrkhan', day_of_week: 3, time: '20:00', lesson_type: 'olympiad' },
]

// === ОЛИМПИАДЫ ===
export const seedOlympiadEvents: OlympiadEvent[] = [
  { id: 'oly-1', name: 'FEMO Весенний', date: '2026-03-15', type: 'femo', description: 'FEMO — Весенний онлайн-этап (FizMat Elementary Math Olympiad)' },
  { id: 'oly-2', name: 'FEMO Международный', date: '2026-06-01', type: 'femo', description: 'FEMO — Международный очный этап, Анталья, Турция (31 мая — 5 июня)' },
]

// === ПОУРОЧНЫЙ ПЛАН ===
const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

type TopicEntry = { topic: string; source: string; olymp: string; hw: string; type: LessonCategory }

// ========== МАРЖАН ==========
// Мама сказала: на выходных 1 день Петерсон, 1 день олимпиада
// Будни (Ср, Пт с марта): олимпиада
// Первые 5 уроков — реальные (по фото)
const marzhanTopics: TopicEntry[] = [
  // === ФЕВРАЛЬ (Сб/Вс, 2 урока в неделю) ===
  // Сб = Петерсон, Вс = олимпиада

  // Неделя 1 (Февраль 1 Вс, 7 Сб) — ПРОВЕДЕНО
  { topic: 'Арифметические задачи: дроби, части, периметр', source: 'Олимп. сборник', olymp: 'FEMO: арифметика', hw: 'Карточка: 5 задач на дроби', type: 'olympiad' },
  { topic: 'Логические задачи: конфеты, мячи, братья', source: 'Олимп. сборник', olymp: 'FEMO: логика', hw: '5 логических задач', type: 'olympiad' },
  // Неделя 2 (Февраль 8 Вс, 14 Сб) — ПРОВЕДЕНО
  { topic: 'FEMO: пробный тест (задачи прошлых лет)', source: 'FEMO прошлых лет', olymp: 'Пробный тест FEMO', hw: 'Работа над ошибками', type: 'olympiad' },
  { topic: 'Задачи на движение (Петерсон)', source: 'Петерсон 4кл, гл.1', olymp: '', hw: 'Стр.15 №3,5,7', type: 'textbook' },
  // Неделя 3 (Февраль 15 Вс, 21 Сб) — 15 ПРОВЕДЕНО, 21 запланировано
  { topic: 'Олимпиадные задачи: семизначное число, рыцари и лжецы, комбинаторика', source: 'FEMO прошлых лет', olymp: 'FEMO: логика + комбинаторика', hw: 'Карточка FEMO', type: 'olympiad' },
  { topic: 'Периметр и площадь (Петерсон)', source: 'Петерсон 4кл, гл.3', olymp: '', hw: 'Стр.45 №2,4,6', type: 'textbook' },
  // Неделя 4 (Февраль 22 Вс, 28 Сб)
  { topic: 'Числовые ребусы и закономерности', source: 'Олимп. сборник', olymp: 'FEMO: ребусы', hw: '4 ребуса', type: 'olympiad' },
  { topic: 'Дроби: сравнение и сложение (Петерсон)', source: 'Петерсон 4кл, гл.5', olymp: '', hw: 'Стр.72 №3,5,8', type: 'textbook' },

  // === МАРТ (Сб/Вс + Ср/Пт, 4 урока в неделю) ===
  // Сб = Петерсон, Вс/Ср/Пт = олимпиада

  // Неделя 5 (Март 1 Вс, 4 Ср, 6 Пт, 7 Сб)
  { topic: 'Задачи на взвешивание', source: 'Олимп. сборник', olymp: 'FEMO: логика', hw: '3 задачи на взвешивание', type: 'olympiad' },
  { topic: 'Задачи на переливание', source: 'Олимп. сборник', olymp: 'FEMO: переливания', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Делимость чисел (олимп.)', source: 'Олимп. сборник', olymp: 'FEMO: делимость', hw: '5 задач', type: 'olympiad' },
  { topic: 'Текстовые задачи: работа (Петерсон)', source: 'Петерсон 4кл, гл.6', olymp: '', hw: 'Стр.98 №1,3,5', type: 'textbook' },
  // Неделя 6 (Март 8 Вс, 11 Ср, 13 Пт, 14 Сб)
  { topic: 'Задачи «кто есть кто» (логика)', source: 'Олимп. сборник', olymp: 'FEMO: логика', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Задачи на чётность', source: 'Олимп. сборник', olymp: 'FEMO: чётность', hw: '5 задач', type: 'olympiad' },
  { topic: 'Графы: знакомство', source: 'Олимп. сборник', olymp: 'FEMO: графы', hw: 'Карточка №3', type: 'olympiad' },
  { topic: 'Уравнения (Петерсон)', source: 'Петерсон 4кл, гл.7', olymp: '', hw: 'Стр.112 №1-5', type: 'textbook' },
  // Неделя 7 (подготовка к FEMO Весенний 15 марта! — 15 Вс, 18 Ср, 20 Пт, 21 Сб)
  { topic: 'Подготовка к FEMO Весенний: пробный тест 1', source: 'FEMO прошлых лет', olymp: 'Полный тест FEMO', hw: 'Работа над ошибками', type: 'olympiad' },
  { topic: 'Подготовка к FEMO Весенний: стратегия и тактика', source: 'FEMO прошлых лет', olymp: 'Тактика решения', hw: 'Повторить формулы', type: 'olympiad' },
  { topic: 'Разбор FEMO Весенний + работа над ошибками', source: 'FEMO 2026', olymp: 'Анализ ошибок', hw: 'Дорешать задачи', type: 'olympiad' },
  { topic: 'Геометрия: симметрия (Петерсон)', source: 'Петерсон 4кл, гл.8', olymp: '', hw: 'Стр.125 №2,4,6', type: 'textbook' },
  // Неделя 8 (22 Вс, 25 Ср, 27 Пт, 28 Сб)
  { topic: 'Принцип Дирихле', source: 'Олимп. сборник', olymp: 'FEMO: Дирихле', hw: '5 задач', type: 'olympiad' },
  { topic: 'Задачи на возраст', source: 'Олимп. сборник', olymp: 'FEMO: возраст', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Магические квадраты', source: 'Олимп. сборник', olymp: 'FEMO: квадраты', hw: 'Карточка №5', type: 'olympiad' },
  { topic: 'Задачи на проценты (Петерсон)', source: 'Петерсон 4кл, гл.9', olymp: '', hw: 'Стр.138 №1-4', type: 'textbook' },

  // === АПРЕЛЬ (подготовка к FEMO Международный) ===
  // Неделя 9 (Апрель 1 Ср, 3 Пт, 4 Сб, 5 Вс)
  { topic: 'Геометрия: разрезания и складывания', source: 'Олимп. сборник', olymp: 'FEMO: геометрия', hw: 'Карточка №6', type: 'olympiad' },
  { topic: 'Комбинаторика: размещения', source: 'Олимп. сборник', olymp: 'FEMO: комбинаторика', hw: '5 задач', type: 'olympiad' },
  { topic: 'Повторение: дроби и уравнения (Петерсон)', source: 'Петерсон 4кл, повтор.', olymp: '', hw: 'Стр.150 №1-6', type: 'textbook' },
  { topic: 'Олимпиадные задачи: микс', source: 'Олимп. сборник', olymp: 'Смешанный набор', hw: '6 задач', type: 'olympiad' },
  // Неделя 10 (Апрель 8 Ср, 10 Пт, 11 Сб, 12 Вс)
  { topic: 'Разбор результатов FEMO Весенний', source: 'FEMO 2026', olymp: 'Анализ ошибок', hw: 'Дорешать задачи', type: 'olympiad' },
  { topic: 'Подготовка к FEMO Международный: обзор тем', source: 'FEMO прошлых лет', olymp: 'Разбор задач', hw: 'Карточка FEMO', type: 'olympiad' },
  { topic: 'FEMO: сложные задачи на логику и комбинаторику', source: 'FEMO прошлых лет', olymp: 'Углублённая подготовка', hw: '6 задач повышенной сложности', type: 'olympiad' },
  { topic: 'Итоговое повторение (Петерсон)', source: 'Петерсон 4кл, повтор.', olymp: '', hw: 'Повторить слабые темы', type: 'textbook' },
]

// ========== БАТЫРХАН ==========
// Мама сказала: полностью готовиться к олимпиадам, искать новые материалы
// Все дни = олимпиада (учебник только изредка для базы)
// Источники: FEMO, Спивак «Мат.праздник», НИШ олимпиады, AMC 8
// Первые 5 уроков — реальные (по фото)
const batyrkhanTopics: TopicEntry[] = [
  // === ФЕВРАЛЬ (Сб/Вс, 2 урока в неделю) ===

  // Неделя 1 (Февраль 1 Вс, 7 Сб) — ПРОВЕДЕНО
  { topic: 'Комбинаторика: перестановки, ягоды/влага, FEMO ребус', source: 'FEMO прошлых лет', olymp: 'FEMO: FEMO+2023=MATH', hw: 'Карточка FEMO №1', type: 'olympiad' },
  { topic: 'Таблица 3×3, магические квадраты, индейцы/бледнолицые', source: 'Олимп. сборник', olymp: 'FEMO: логика', hw: '5 задач на таблицы', type: 'olympiad' },
  // Неделя 2 (Февраль 8 Вс, 14 Сб) — ПРОВЕДЕНО
  { topic: 'Принцип Дирихле: шары 1-2025, операции с простыми делителями', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: Дирихле', hw: '5 задач Дирихле', type: 'olympiad' },
  { topic: 'A×B×C=30, графы (дворник 3×3), 8 натуральных чисел', source: 'FEMO + НИШ олимпиады', olymp: 'FEMO: графы + числа', hw: 'Карточка FEMO №2', type: 'olympiad' },
  // Неделя 3 (Февраль 15 Вс, 21 Сб) — 15 ПРОВЕДЕНО, 21 запланировано
  { topic: 'Четверо детей/возраст, прямоугольник/периметр, рыцари и лжецы 15', source: 'FEMO прошлых лет', olymp: 'FEMO: логика', hw: 'Карточка логика', type: 'olympiad' },
  { topic: 'Делимость: признаки, НОД и НОК', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: делимость', hw: '5 задач делимость', type: 'olympiad' },
  // Неделя 4 (Февраль 22 Вс, 28 Сб)
  { topic: 'Десятичные дроби: олимпиадные задачи', source: 'Олимп. сборник', olymp: 'FEMO: дроби', hw: '6 задач', type: 'olympiad' },
  { topic: 'Числовые ребусы и головоломки', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: ребусы', hw: '4 ребуса', type: 'olympiad' },

  // === МАРТ (Сб/Вс + Пн/Ср, 4 урока в неделю) ===
  // Все дни = олимпиада

  // Неделя 5 (Март 1 Вс, 2 Пн, 4 Ср, 7 Сб)
  { topic: 'Геометрия: углы, треугольники (олимп.)', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: геометрия', hw: '5 задач', type: 'olympiad' },
  { topic: 'Задачи на движение по реке', source: 'Олимп. сборник', olymp: 'FEMO: движение', hw: 'Карточка №3', type: 'olympiad' },
  { topic: 'Задачи на переливание и взвешивание', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: переливания', hw: '4+4 задачи', type: 'olympiad' },
  { topic: 'Теория графов: обходы, деревья', source: 'НИШ олимпиады', olymp: 'FEMO: графы', hw: '5 задач графы', type: 'olympiad' },
  // Неделя 6 (Март 8 Вс, 9 Пн, 11 Ср, 14 Сб)
  { topic: 'Задачи на чётность и делимость', source: 'FEMO прошлых лет', olymp: 'FEMO: чётность', hw: '5 задач', type: 'olympiad' },
  { topic: 'Текстовые задачи: смеси и сплавы', source: 'НИШ олимпиады', olymp: 'FEMO: текстовые', hw: '5 задач', type: 'olympiad' },
  { topic: 'Раскраски и шахматная доска', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: раскраски', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Числовые закономерности и последовательности', source: 'AMC 8 (адапт.)', olymp: 'FEMO: последовательности', hw: 'Карточка №4', type: 'olympiad' },
  // Неделя 7 (подготовка к FEMO Весенний 15 марта! — 15 Вс, 16 Пн, 18 Ср, 21 Сб)
  { topic: 'Подготовка к FEMO Весенний: пробный тест 1', source: 'FEMO прошлых лет', olymp: 'Полный тест FEMO', hw: 'Работа над ошибками', type: 'olympiad' },
  { topic: 'Подготовка к FEMO Весенний: стратегия', source: 'FEMO прошлых лет', olymp: 'Тактика решения', hw: 'Повторить формулы', type: 'olympiad' },
  { topic: 'Генеральная репетиция FEMO Весенний', source: 'FEMO прошлых лет', olymp: 'Полный тест с таймером', hw: 'Отдых перед олимпиадой!', type: 'olympiad' },
  { topic: 'Разбор FEMO Весенний + работа над ошибками', source: 'FEMO 2026', olymp: 'Анализ ошибок', hw: 'Дорешать задачи', type: 'olympiad' },
  // Неделя 8 (22 Вс, 23 Пн, 25 Ср, 28 Сб)
  { topic: 'Инварианты', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: инварианты', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Задачи на оптимизацию', source: 'НИШ олимпиады', olymp: 'FEMO: оптимизация', hw: '5 задач', type: 'olympiad' },
  { topic: 'Координаты на плоскости (олимп.)', source: 'AMC 8 (адапт.)', olymp: 'FEMO: координаты', hw: '4 задачи', type: 'olympiad' },
  { topic: 'Магические квадраты и латинские квадраты', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: квадраты', hw: 'Карточка №5', type: 'olympiad' },

  // === АПРЕЛЬ (подготовка к FEMO Международный, июнь) ===
  // Неделя 9 (Апрель 1 Ср, 4 Сб, 5 Вс, 6 Пн)
  { topic: 'Разбор результатов FEMO Весенний', source: 'FEMO 2026', olymp: 'Анализ ошибок', hw: 'Дорешать задачи', type: 'olympiad' },
  { topic: 'Площадь и объём (олимп.)', source: 'НИШ олимпиады', olymp: 'FEMO: площади', hw: '5 задач', type: 'olympiad' },
  { topic: 'Факториалы и комбинации', source: 'Спивак «Мат.праздник»', olymp: 'FEMO: комбинаторика', hw: '5 задач', type: 'olympiad' },
  { topic: 'Олимпиадные задачи: микс', source: 'FEMO + НИШ + Спивак', olymp: 'Смешанный набор', hw: '6 задач', type: 'olympiad' },
  // Неделя 10 (Апрель 8 Ср, 11 Сб, 12 Вс, 13 Пн)
  { topic: 'Подготовка к FEMO Международный: обзор тем', source: 'FEMO прошлых лет', olymp: 'Разбор задач', hw: 'Карточка FEMO', type: 'olympiad' },
  { topic: 'FEMO: сложные задачи на логику и графы', source: 'FEMO прошлых лет', olymp: 'Углублённая подготовка', hw: '6 задач повышенной сложности', type: 'olympiad' },
  { topic: 'FEMO: сложные задачи на комбинаторику и числа', source: 'FEMO прошлых лет', olymp: 'Углублённая подготовка', hw: 'Финальная подготовка', type: 'olympiad' },
  { topic: 'Итоговое повторение всех тем', source: 'Олимп. сборник + Спивак', olymp: 'Обзор всех тем', hw: 'Повторить слабые темы', type: 'olympiad' },
]

// Генерация дат с разным расписанием для каждого ученика
// Февраль: Сб/Вс (оба)
// Март+:
//   Маржан: Ср(3), Пт(5), Сб(6), Вс(0)
//   Батырхан: Пн(1), Ср(3), Сб(6), Вс(0)
function generateDates(count: number, marchWeekdays: number[]): { date: string; day: string }[] {
  const result: { date: string; day: string }[] = []
  const weekendDays = [0, 6] // Вс, Сб
  const marchStart = new Date('2026-03-01')
  const current = new Date('2026-02-01')

  while (result.length < count) {
    const dow = current.getDay()
    const isBeforeMarch = current < marchStart

    if (isBeforeMarch) {
      if (weekendDays.includes(dow)) {
        result.push({ date: current.toISOString().slice(0, 10), day: dayNames[dow] })
      }
    } else {
      if (weekendDays.includes(dow) || marchWeekdays.includes(dow)) {
        result.push({ date: current.toISOString().slice(0, 10), day: dayNames[dow] })
      }
    }
    current.setDate(current.getDate() + 1)
  }

  return result
}

const marzhanDates = generateDates(marzhanTopics.length, [3, 5])  // Ср, Пт
const batyrkhanDates = generateDates(batyrkhanTopics.length, [1, 3])  // Пн, Ср

// Подсчёт номера недели по дате
function getWeekNumber(dateStr: string, allDates: { date: string }[]): number {
  const d = new Date(dateStr)
  const getMonday = (dt: Date) => {
    const day = dt.getDay()
    const diff = day === 0 ? -6 : 1 - day
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + diff)
  }
  const firstDate = new Date(allDates[0].date)
  const firstMonday = getMonday(firstDate)
  const thisMonday = getMonday(d)
  const weekDiff = Math.round((thisMonday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return weekDiff + 1
}

// Уроки до 17 февраля = completed (5 уроков проведено с каждым)
const today = '2026-02-17'

export const seedLessonPlans: LessonPlan[] = [
  ...marzhanTopics.map((t, i) => ({
    id: `lp-m-${i + 1}`,
    student_id: 'student-marzhan',
    week_number: getWeekNumber(marzhanDates[i].date, marzhanDates),
    date: marzhanDates[i].date,
    day_label: marzhanDates[i].day,
    topic: t.topic,
    source: t.source,
    olympiad_tasks: t.olymp,
    homework: t.hw,
    status: (marzhanDates[i].date < today ? 'completed' : 'planned') as LessonPlan['status'],
    order_index: i,
    lesson_type: t.type,
  })),
  ...batyrkhanTopics.map((t, i) => ({
    id: `lp-b-${i + 1}`,
    student_id: 'student-batyrkhan',
    week_number: getWeekNumber(batyrkhanDates[i].date, batyrkhanDates),
    date: batyrkhanDates[i].date,
    day_label: batyrkhanDates[i].day,
    topic: t.topic,
    source: t.source,
    olympiad_tasks: t.olymp,
    homework: t.hw,
    status: (batyrkhanDates[i].date < today ? 'completed' : 'planned') as LessonPlan['status'],
    order_index: i,
    lesson_type: t.type,
  })),
]

// === Демо-результаты уроков (реальные данные по фото) ===
// Маржан: 5 completed уроков
// Батырхан: 5 completed уроков

const marzhanCompleted = marzhanDates.filter((d) => d.date < today).length
const batyrkhanCompleted = batyrkhanDates.filter((d) => d.date < today).length

export const seedLessonResults: LessonResult[] = [
  // Маржан — реальные результаты
  {
    id: 'lr-m-1', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-1',
    date: marzhanDates[0].date, topic: marzhanTopics[0].topic,
    understanding: 4, tasks_solved: 12, tasks_correct: 9,
    homework_given: marzhanTopics[0].hw, homework_done: 'done',
    teacher_comment_private: 'Хорошо считает дроби, задачи на части ещё сложноваты',
    teacher_comment_parent: 'Маржан хорошо поработала! Решила 9 из 12 задач на арифметику.',
    created_at: marzhanDates[0].date,
  },
  {
    id: 'lr-m-2', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-2',
    date: marzhanDates[1].date, topic: marzhanTopics[1].topic,
    understanding: 4, tasks_solved: 10, tasks_correct: 7,
    homework_given: marzhanTopics[1].hw, homework_done: 'done',
    teacher_comment_private: 'Логические задачи с конфетами решает хорошо, мячи — пока путается',
    teacher_comment_parent: 'Разбираем логические задачи — Маржан решает с интересом!',
    created_at: marzhanDates[1].date,
  },
  {
    id: 'lr-m-3', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-3',
    date: marzhanDates[2].date, topic: marzhanTopics[2].topic,
    understanding: 3, tasks_solved: 15, tasks_correct: 8,
    homework_given: marzhanTopics[2].hw, homework_done: 'done',
    teacher_comment_private: 'Пробный FEMO: задачи 1-4 ок, 5-7 сложно. Нужно подтянуть геометрию.',
    teacher_comment_parent: 'Написали пробный FEMO! Маржан решила 8 из 15, хороший старт.',
    created_at: marzhanDates[2].date,
  },
  {
    id: 'lr-m-4', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-4',
    date: marzhanDates[3].date, topic: marzhanTopics[3].topic,
    understanding: 4, tasks_solved: 10, tasks_correct: 8,
    homework_given: marzhanTopics[3].hw, homework_done: 'done',
    teacher_comment_private: 'Петерсон: задачи на движение — встречное нормально, вдогонку ещё сложно',
    teacher_comment_parent: 'Прошли задачи на движение по Петерсону, Маржан справилась хорошо.',
    created_at: marzhanDates[3].date,
  },
  {
    id: 'lr-m-5', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-5',
    date: marzhanDates[4].date, topic: marzhanTopics[4].topic,
    understanding: 3, tasks_solved: 10, tasks_correct: 6,
    homework_given: marzhanTopics[4].hw, homework_done: 'partial',
    teacher_comment_private: 'FEMO задачи сложные — семизначное число не осилила, рыцари/лжецы ок',
    teacher_comment_parent: 'Разбирали олимпиадные задачи FEMO-уровня. Рыцари и лжецы — отлично!',
    created_at: marzhanDates[4].date,
  },
  // Батырхан — реальные результаты
  {
    id: 'lr-b-1', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-1',
    date: batyrkhanDates[0].date, topic: batyrkhanTopics[0].topic,
    understanding: 4, tasks_solved: 12, tasks_correct: 9,
    homework_given: batyrkhanTopics[0].hw, homework_done: 'done',
    teacher_comment_private: 'FEMO ребус FEMO+2023=MATH решил! Комбинаторика ок, проценты с ягодами — пришлось объяснять дважды',
    teacher_comment_parent: 'Батырхан решил сложный ребус FEMO! Отличное начало.',
    created_at: batyrkhanDates[0].date,
  },
  {
    id: 'lr-b-2', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-2',
    date: batyrkhanDates[1].date, topic: batyrkhanTopics[1].topic,
    understanding: 4, tasks_solved: 10, tasks_correct: 8,
    homework_given: batyrkhanTopics[1].hw, homework_done: 'done',
    teacher_comment_private: 'Магические квадраты 3×3 понял сразу, индейцы/бледнолицые — с подсказкой',
    teacher_comment_parent: 'Магические квадраты — отлично! Разбираем логику.',
    created_at: batyrkhanDates[1].date,
  },
  {
    id: 'lr-b-3', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-3',
    date: batyrkhanDates[2].date, topic: batyrkhanTopics[2].topic,
    understanding: 5, tasks_solved: 12, tasks_correct: 10,
    homework_given: batyrkhanTopics[2].hw, homework_done: 'done',
    teacher_comment_private: 'Дирихле: шары 1-2025 решил сам! Операции с простыми делителями (2025→0) — понял идею',
    teacher_comment_parent: 'Принцип Дирихле — Батырхан схватывает быстро! 10 из 12 верно.',
    created_at: batyrkhanDates[2].date,
  },
  {
    id: 'lr-b-4', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-4',
    date: batyrkhanDates[3].date, topic: batyrkhanTopics[3].topic,
    understanding: 4, tasks_solved: 10, tasks_correct: 7,
    homework_given: batyrkhanTopics[3].hw, homework_done: 'done',
    teacher_comment_private: 'A×B×C=30 — нашёл решение. Дворник 3×3 (4200м) — с подсказкой. 8 натуральных чисел — слишком сложно пока',
    teacher_comment_parent: 'Разбирали задачи на графы и числа — хороший прогресс!',
    created_at: batyrkhanDates[3].date,
  },
  {
    id: 'lr-b-5', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-5',
    date: batyrkhanDates[4].date, topic: batyrkhanTopics[4].topic,
    understanding: 4, tasks_solved: 10, tasks_correct: 7,
    homework_given: batyrkhanTopics[4].hw, homework_done: 'done',
    teacher_comment_private: 'Возрастные задачи — ок. Прямоугольник с периметром — нужна практика. Рыцари 15 человек — решил!',
    teacher_comment_parent: 'Батырхан уверенно решает олимпиадные задачи, молодец!',
    created_at: batyrkhanDates[4].date,
  },
  // Дополнительные результаты если completed > 5
  ...Array.from({ length: Math.max(0, marzhanCompleted - 5) }, (_, i) => ({
    id: `lr-m-${i + 6}`,
    student_id: 'student-marzhan',
    lesson_plan_id: `lp-m-${i + 6}`,
    date: marzhanDates[i + 5].date,
    topic: marzhanTopics[i + 5].topic,
    understanding: 3 + Math.floor(Math.random() * 2),
    tasks_solved: 8 + Math.floor(Math.random() * 5),
    tasks_correct: 5 + Math.floor(Math.random() * 5),
    homework_given: marzhanTopics[i + 5].hw,
    homework_done: (['done', 'done', 'partial'] as const)[i % 3],
    teacher_comment_private: 'Продолжаем работать',
    teacher_comment_parent: 'Маржан хорошо поработала!',
    created_at: marzhanDates[i + 5].date,
  })),
  ...Array.from({ length: Math.max(0, batyrkhanCompleted - 5) }, (_, i) => ({
    id: `lr-b-${i + 6}`,
    student_id: 'student-batyrkhan',
    lesson_plan_id: `lp-b-${i + 6}`,
    date: batyrkhanDates[i + 5].date,
    topic: batyrkhanTopics[i + 5].topic,
    understanding: 4 + Math.floor(Math.random() * 2),
    tasks_solved: 10 + Math.floor(Math.random() * 5),
    tasks_correct: 7 + Math.floor(Math.random() * 5),
    homework_given: batyrkhanTopics[i + 5].hw,
    homework_done: (['done', 'done', 'done'] as const)[i % 3],
    teacher_comment_private: 'Продолжаем подготовку к олимпиадам',
    teacher_comment_parent: 'Батырхан показывает хороший прогресс!',
    created_at: batyrkhanDates[i + 5].date,
  })),
]

// === БАЗА ЗНАНИЙ (24 темы) ===
export const seedKnowledgeBase: KnowledgeBase[] = [
  { id: 'kb-1', section: 'Арифметика', topic: 'Натуральные числа и операции', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 2, femo_intl_importance: 1 },
  { id: 'kb-2', section: 'Арифметика', topic: 'Делимость чисел', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 3, femo_intl_importance: 3 },
  { id: 'kb-3', section: 'Арифметика', topic: 'НОД и НОК', grade_4_level: '—', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-4', section: 'Арифметика', topic: 'Дроби обыкновенные', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-5', section: 'Арифметика', topic: 'Дроби десятичные', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 2 },
  { id: 'kb-6', section: 'Арифметика', topic: 'Проценты', grade_4_level: '—', grade_5_level: 'Знакомство', femo_spring_importance: 1, femo_intl_importance: 2 },
  { id: 'kb-7', section: 'Геометрия', topic: 'Периметр и площадь', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-8', section: 'Геометрия', topic: 'Углы и треугольники', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-9', section: 'Геометрия', topic: 'Симметрия', grade_4_level: 'Базовый', grade_5_level: 'Базовый', femo_spring_importance: 3, femo_intl_importance: 1 },
  { id: 'kb-10', section: 'Геометрия', topic: 'Разрезания и складывания', grade_4_level: 'Базовый', grade_5_level: 'Базовый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-11', section: 'Логика', topic: 'Таблицы истинности', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-12', section: 'Логика', topic: 'Рыцари и лжецы', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-13', section: 'Логика', topic: 'Принцип Дирихле', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 1, femo_intl_importance: 3 },
  { id: 'kb-14', section: 'Логика', topic: 'Инварианты', grade_4_level: '—', grade_5_level: 'Знакомство', femo_spring_importance: 1, femo_intl_importance: 3 },
  { id: 'kb-15', section: 'Комбинаторика', topic: 'Перебор вариантов', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-16', section: 'Комбинаторика', topic: 'Правило произведения', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-17', section: 'Комбинаторика', topic: 'Раскраски', grade_4_level: '—', grade_5_level: 'Знакомство', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-18', section: 'Текстовые задачи', topic: 'Задачи на движение', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-19', section: 'Текстовые задачи', topic: 'Задачи на работу', grade_4_level: 'Базовый', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 2 },
  { id: 'kb-20', section: 'Текстовые задачи', topic: 'Задачи на части и доли', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 2, femo_intl_importance: 3 },
  { id: 'kb-21', section: 'Головоломки', topic: 'Числовые ребусы', grade_4_level: 'Базовый', grade_5_level: 'Базовый', femo_spring_importance: 3, femo_intl_importance: 1 },
  { id: 'kb-22', section: 'Головоломки', topic: 'Переливания и взвешивания', grade_4_level: 'Базовый', grade_5_level: 'Продвинутый', femo_spring_importance: 3, femo_intl_importance: 2 },
  { id: 'kb-23', section: 'Головоломки', topic: 'Магические квадраты', grade_4_level: 'Базовый', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 1 },
  { id: 'kb-24', section: 'Графы', topic: 'Основы теории графов', grade_4_level: 'Знакомство', grade_5_level: 'Базовый', femo_spring_importance: 2, femo_intl_importance: 3 },
]

// === ЕЖЕНЕДЕЛЬНЫЕ ОТЧЁТЫ ===
export const seedWeeklyReports: WeeklyReport[] = [
  {
    id: 'wr-m-1',
    student_id: 'student-marzhan',
    week_number: 1,
    week_start: '2026-02-01',
    week_end: '2026-02-08',
    topics_covered: ['Арифметика: дроби, части, периметр', 'Логика: конфеты, мячи, братья'],
    tasks_solved: 22,
    tasks_correct: 16,
    homework_done: true,
    achievements: 'Маржан отлично решает задачи на дроби и логические задачи! С удовольствием разбирает «кто съел больше конфет».',
    next_week_focus: 'Пробный тест FEMO и задачи на движение по Петерсону.',
    teacher_summary: 'Хорошее начало! Маржан активно работает и с интересом решает задачи.',
    created_at: '2026-02-08T18:00:00Z',
  },
  {
    id: 'wr-m-2',
    student_id: 'student-marzhan',
    week_number: 2,
    week_start: '2026-02-08',
    week_end: '2026-02-15',
    topics_covered: ['FEMO пробный тест', 'Задачи на движение (Петерсон)', 'FEMO: рыцари и лжецы'],
    tasks_solved: 35,
    tasks_correct: 22,
    homework_done: true,
    achievements: 'Написали первый пробный FEMO! Рыцари и лжецы — решает с интересом.',
    next_week_focus: 'Петерсон: периметр/площадь. Олимпиада: ребусы и закономерности.',
    teacher_summary: 'Маржан решает 63% задач верно — это нормальный результат для начала. До FEMO Весенний ещё месяц!',
    created_at: '2026-02-15T18:00:00Z',
  },
  {
    id: 'wr-b-1',
    student_id: 'student-batyrkhan',
    week_number: 1,
    week_start: '2026-02-01',
    week_end: '2026-02-08',
    topics_covered: ['FEMO ребус FEMO+2023=MATH', 'Магические квадраты 3×3', 'Индейцы/бледнолицые'],
    tasks_solved: 22,
    tasks_correct: 17,
    homework_done: true,
    achievements: 'Батырхан решил сложный ребус FEMO! Магические квадраты понял с первого раза.',
    next_week_focus: 'Принцип Дирихле и задачи на графы.',
    teacher_summary: 'Отличное начало! Батырхан быстро схватывает олимпиадные идеи.',
    created_at: '2026-02-08T18:00:00Z',
  },
  {
    id: 'wr-b-2',
    student_id: 'student-batyrkhan',
    week_number: 2,
    week_start: '2026-02-08',
    week_end: '2026-02-15',
    topics_covered: ['Принцип Дирихле', 'Графы: дворник 3×3', 'A×B×C=30', 'Рыцари и лжецы 15 чел'],
    tasks_solved: 32,
    tasks_correct: 24,
    homework_done: true,
    achievements: 'Принцип Дирихле (шары 1-2025) — решил сам! Графы — понял идею обхода.',
    next_week_focus: 'Делимость, НОД/НОК и десятичные дроби.',
    teacher_summary: 'Батырхан показывает 75% верных ответов — отличный результат на олимпиадных задачах!',
    created_at: '2026-02-15T18:00:00Z',
  },
]

// === РЕКОМЕНДУЕМЫЕ КНИГИ И РЕСУРСЫ ===
export const seedResources: Resource[] = [
  // Основные олимпиадные сборники
  { id: 'res-1', title: 'Математика. Олимпиадные задачи (2-4 класс)', author: 'Т.Б. Клементьева',
    description: 'Сборник олимпиадных задач для начальной школы. Хорошие задачи на логику, комбинаторику и арифметику.',
    grade_level: '4', category: 'olympiad', topics: ['Перебор вариантов', 'Таблицы истинности', 'Числовые ребусы'] },
  { id: 'res-2', title: 'Математический праздник', author: 'А.В. Спивак',
    description: 'Классический сборник олимпиадных задач. Задачи от простых до сложных. Отлично подходит для подготовки к FEMO.',
    grade_level: '4-5', category: 'olympiad', topics: ['Принцип Дирихле', 'Инварианты', 'Раскраски', 'Переливания и взвешивания'] },
  { id: 'res-3', title: 'Задачи для подготовки к олимпиадам', author: 'НИШ (Назарбаев Интеллектуальная Школа)',
    description: 'Сборник задач от НИШ олимпиад. Задачи уровня городских/областных олимпиад.',
    grade_level: '5', category: 'olympiad', topics: ['Задачи на движение', 'Задачи на работу', 'Углы и треугольники'] },
  { id: 'res-4', title: 'AMC 8 Problems & Solutions', author: 'MAA (Mathematical Association of America)',
    description: 'Адаптированные задачи AMC 8. Международный уровень сложности.',
    grade_level: '5', category: 'olympiad', topics: ['Правило произведения', 'Периметр и площадь', 'Делимость чисел'] },
  { id: 'res-5', title: 'FEMO — задачи прошлых лет', author: 'FizMat Olympiad',
    description: 'Официальные задачи FEMO прошлых лет. Лучший источник для подготовки.',
    grade_level: '4-5', category: 'olympiad', topics: ['Числовые ребусы', 'Рыцари и лжецы', 'Комбинаторика', 'Геометрия'] },
  { id: 'res-6', title: '1001 олимпиадная задача по математике', author: 'Э.Н. Балаян',
    description: 'Огромный банк задач с решениями. Задачи разбиты по темам и уровням сложности.',
    grade_level: '4-5', category: 'olympiad', topics: ['Задачи на части и доли', 'НОД и НОК', 'Дроби обыкновенные'] },
  { id: 'res-7', title: 'Олимпиадная математика: логика', author: 'И.А. Шаригин, А.В. Шевкин',
    description: 'Классические задачи на логику для олимпиадной подготовки.',
    grade_level: '5', category: 'olympiad', topics: ['Рыцари и лжецы', 'Таблицы истинности', 'Принцип Дирихле'] },
  // Учебники
  { id: 'res-8', title: 'Петерсон. Математика 4 класс', author: 'Л.Г. Петерсон',
    description: 'Основной учебник для 4 класса. Используем для базовых тем параллельно с олимпиадной подготовкой.',
    grade_level: '4', category: 'textbook', topics: ['Задачи на движение', 'Периметр и площадь', 'Дроби обыкновенные'] },
  { id: 'res-9', title: 'Кенгуру — задачи прошлых лет (3-4 класс)', author: 'Кенгуру',
    description: 'Задачи математического конкурса Кенгуру. Хороший разогрев перед олимпиадами.',
    grade_level: '4', category: 'olympiad', topics: ['Перебор вариантов', 'Числовые ребусы', 'Симметрия'] },
  { id: 'res-10', title: 'Олимпиады «Формула Единства»', author: 'Формула Единства',
    description: 'Международные олимпиады. Задачи с разбором.',
    grade_level: '5', category: 'olympiad', topics: ['Основы теории графов', 'Инварианты', 'Раскраски'] },
]

// === БЕЙДЖИ (начальные) ===
export const seedBadges: StudentBadge[] = [
  { id: 'badge-m-1', student_id: 'student-marzhan', badge_type: 'first_task', earned_at: '2026-02-17T18:30:00Z' },
  { id: 'badge-b-1', student_id: 'student-batyrkhan', badge_type: 'first_task', earned_at: '2026-02-17T18:30:00Z' },
]

// === ДОМАШНИЕ ЗАДАНИЯ (олимпиадный уровень) ===
// Неделя 3 (текущая) + 4 недели вперёд (недели 4-7)
export const seedAssignments: Assignment[] = [
  // ===== НЕДЕЛЯ 3 (18-22 февраля) =====
  // Маржан — урок 5: семизначное число, рыцари и лжецы
  {
    id: 'asgn-m-1', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-5',
    title: 'Логика + комбинаторика (FEMO)', description: 'Задачи после урока: рыцари, семизначное число',
    due_date: '2026-02-22', is_active: true, created_at: '2026-02-15T18:00:00Z',
  },
  // Маржан — урок 6: периметр/площадь
  {
    id: 'asgn-m-2', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-6',
    title: 'Периметр и площадь (Петерсон)', description: 'Геометрия: площадь, периметр, разрезания',
    due_date: '2026-02-25', is_active: true, created_at: '2026-02-17T18:00:00Z',
  },
  // Батырхан — урок 5: рыцари и лжецы, периметр
  {
    id: 'asgn-b-1', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-5',
    title: 'FEMO: логика (рыцари и лжецы)', description: 'Олимпиадная логика FEMO-уровня',
    due_date: '2026-02-22', is_active: true, created_at: '2026-02-15T18:00:00Z',
  },
  // Батырхан — урок 6: делимость
  {
    id: 'asgn-b-2', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-6',
    title: 'Делимость: НОД и НОК', description: 'Признаки делимости, НОД, НОК — FEMO',
    due_date: '2026-02-25', is_active: true, created_at: '2026-02-17T18:00:00Z',
  },

  // ===== НЕДЕЛЯ 4 (22-28 февраля) =====
  // Маржан — урок 7: числовые ребусы
  {
    id: 'asgn-m-3', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-7',
    title: 'Числовые ребусы и закономерности', description: 'Ребусы типа FEMO + числовые закономерности',
    due_date: '2026-03-01', is_active: true, created_at: '2026-02-22T18:00:00Z',
  },
  // Маржан — урок 8: дроби (Петерсон)
  {
    id: 'asgn-m-4', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-8',
    title: 'Дроби: сравнение и сложение', description: 'Петерсон: дроби + олимпиадные задачи на части',
    due_date: '2026-03-04', is_active: true, created_at: '2026-02-28T18:00:00Z',
  },
  // Батырхан — урок 7: десятичные дроби
  {
    id: 'asgn-b-3', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-7',
    title: 'Десятичные дроби (олимп.)', description: 'Олимпиадные задачи на десятичные дроби',
    due_date: '2026-03-01', is_active: true, created_at: '2026-02-22T18:00:00Z',
  },
  // Батырхан — урок 8: ребусы
  {
    id: 'asgn-b-4', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-8',
    title: 'Числовые ребусы и головоломки', description: 'Спивак: ребусы, криптоарифметика',
    due_date: '2026-03-04', is_active: true, created_at: '2026-02-28T18:00:00Z',
  },

  // ===== НЕДЕЛЯ 5 (1-7 марта) =====
  // Маржан — уроки 9-12 (4 урока: Вс, Ср, Пт, Сб)
  {
    id: 'asgn-m-5', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-9',
    title: 'Задачи на взвешивание', description: 'FEMO: классические задачи на взвешивание',
    due_date: '2026-03-04', is_active: true, created_at: '2026-03-01T18:00:00Z',
  },
  {
    id: 'asgn-m-6', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-10',
    title: 'Задачи на переливание', description: 'FEMO: переливания из сосуда в сосуд',
    due_date: '2026-03-06', is_active: true, created_at: '2026-03-04T18:00:00Z',
  },
  {
    id: 'asgn-m-7', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-11',
    title: 'Делимость чисел (олимп.)', description: 'Признаки делимости, простые и составные числа',
    due_date: '2026-03-07', is_active: true, created_at: '2026-03-06T18:00:00Z',
  },
  // Батырхан — уроки 9-12
  {
    id: 'asgn-b-5', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-9',
    title: 'Геометрия: углы, треугольники', description: 'Спивак: олимпиадная геометрия',
    due_date: '2026-03-02', is_active: true, created_at: '2026-03-01T18:00:00Z',
  },
  {
    id: 'asgn-b-6', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-10',
    title: 'Задачи на движение по реке', description: 'Олимпиадные задачи: течение реки, скорости',
    due_date: '2026-03-04', is_active: true, created_at: '2026-03-02T18:00:00Z',
  },
  {
    id: 'asgn-b-7', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-11',
    title: 'Переливания и взвешивания', description: 'Спивак: классические задачи',
    due_date: '2026-03-07', is_active: true, created_at: '2026-03-04T18:00:00Z',
  },

  // ===== НЕДЕЛЯ 6 (8-14 марта) — подготовка к FEMO Весенний! =====
  // Маржан — уроки 13-16
  {
    id: 'asgn-m-8', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-13',
    title: 'Логика «кто есть кто»', description: 'Задачи на таблицы истинности и логические выводы',
    due_date: '2026-03-11', is_active: true, created_at: '2026-03-08T18:00:00Z',
  },
  {
    id: 'asgn-m-9', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-14',
    title: 'Задачи на чётность', description: 'FEMO: чётность/нечётность в олимпиадных задачах',
    due_date: '2026-03-13', is_active: true, created_at: '2026-03-11T18:00:00Z',
  },
  {
    id: 'asgn-m-10', student_id: 'student-marzhan', lesson_plan_id: 'lp-m-15',
    title: 'Графы: знакомство', description: 'Основы графов: вершины, рёбра, обходы',
    due_date: '2026-03-14', is_active: true, created_at: '2026-03-13T18:00:00Z',
  },
  // Батырхан — уроки 13-16
  {
    id: 'asgn-b-8', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-13',
    title: 'Чётность и делимость', description: 'FEMO: продвинутые задачи на чётность',
    due_date: '2026-03-11', is_active: true, created_at: '2026-03-08T18:00:00Z',
  },
  {
    id: 'asgn-b-9', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-14',
    title: 'Смеси и сплавы', description: 'НИШ: текстовые задачи на смеси',
    due_date: '2026-03-11', is_active: true, created_at: '2026-03-09T18:00:00Z',
  },
  {
    id: 'asgn-b-10', student_id: 'student-batyrkhan', lesson_plan_id: 'lp-b-15',
    title: 'Раскраски и шахматная доска', description: 'Спивак: раскраски, шахматные клетки',
    due_date: '2026-03-14', is_active: true, created_at: '2026-03-11T18:00:00Z',
  },
]

export const seedAssignmentTasks: AssignmentTask[] = [
  // ===== НЕДЕЛЯ 3: МАРЖАН — логика + комбинаторика (asgn-m-1) =====
  { id: 'task-m-1', assignment_id: 'asgn-m-1', order_index: 0, task_type: 'multiple_choice',
    question: 'На острове живут рыцари (всегда говорят правду) и лжецы (всегда лгут). Встречаются два жителя. Первый говорит: «Мы оба лжецы». Кто они?',
    options: ['Оба рыцари', 'Оба лжецы', 'Первый — лжец, второй — рыцарь', 'Первый — рыцарь, второй — лжец'],
    correct_answer: 'Первый — лжец, второй — рыцарь', points: 3 },
  { id: 'task-m-2', assignment_id: 'asgn-m-1', order_index: 1, task_type: 'short_answer',
    question: 'Маша задумала семизначное число, в котором каждая следующая цифра на 1 больше предыдущей. Какая цифра стоит на первом месте?',
    correct_answer: '1', points: 3 },
  { id: 'task-m-3', assignment_id: 'asgn-m-1', order_index: 2, task_type: 'short_answer',
    question: 'У Маши 24 конфеты. Она отдала брату 1/3 всех конфет. Сколько конфет осталось у Маши?',
    correct_answer: '16', points: 3 },
  { id: 'task-m-4', assignment_id: 'asgn-m-1', order_index: 3, task_type: 'multiple_choice',
    question: 'Сколькими способами можно рассадить 3 ученика на 3 стула?',
    options: ['3', '6', '9', '12'], correct_answer: '6', points: 4 },
  { id: 'task-m-5', assignment_id: 'asgn-m-1', order_index: 4, task_type: 'open_ended',
    question: 'На острове 15 жителей: рыцари и лжецы. Каждый написал на бумажке: «Среди остальных 14 жителей не меньше 8 лжецов». Сколько лжецов на острове, если известно, что лжецы написали ложное утверждение? Объясни решение.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 3: МАРЖАН — периметр/площадь (asgn-m-2) =====
  { id: 'task-m-6', assignment_id: 'asgn-m-2', order_index: 0, task_type: 'short_answer',
    question: 'Периметр прямоугольника 24 см. Длина на 4 см больше ширины. Найди площадь (в кв. см).',
    correct_answer: '32', points: 3 },
  { id: 'task-m-7', assignment_id: 'asgn-m-2', order_index: 1, task_type: 'short_answer',
    question: 'Из квадрата со стороной 6 см вырезали квадрат со стороной 2 см из угла. Чему равен периметр получившейся фигуры (в см)?',
    correct_answer: '24', points: 3 },
  { id: 'task-m-8', assignment_id: 'asgn-m-2', order_index: 2, task_type: 'multiple_choice',
    question: 'Площадь квадрата 49 кв. см. Чему равен его периметр?',
    options: ['24 см', '28 см', '32 см', '36 см'], correct_answer: '28 см', points: 3 },
  { id: 'task-m-9', assignment_id: 'asgn-m-2', order_index: 3, task_type: 'open_ended',
    question: 'Прямоугольную комнату 5×3 метра нужно выложить квадратной плиткой без разрезов. Какой наибольший размер плитки можно использовать? Сколько плиток потребуется?',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 3: БАТЫРХАН — логика (asgn-b-1) =====
  { id: 'task-b-1', assignment_id: 'asgn-b-1', order_index: 0, task_type: 'multiple_choice',
    question: 'В числовом примере 6ДБ+9 = ГДЕ буквами обозначают шесть разных цифр. Какая цифра обозначена буквой Д?',
    options: ['1', '3', '5', '7'], correct_answer: '5', points: 4 },
  { id: 'task-b-2', assignment_id: 'asgn-b-1', order_index: 1, task_type: 'short_answer',
    question: 'На острове рыцарей и лжецов 9 жителей сели за круглый стол. Каждый сказал: «Мои соседи — лжец и рыцарь». Сколько рыцарей за столом?',
    correct_answer: '6', points: 5 },
  { id: 'task-b-3', assignment_id: 'asgn-b-1', order_index: 2, task_type: 'short_answer',
    question: 'Четверо детей сравнили свой возраст. Сумма возрастов двоих старших на 4 больше суммы двоих младших. На сколько лет старший ребёнок старше младшего, если возрасты идут подряд?',
    correct_answer: '3', points: 4 },
  { id: 'task-b-4', assignment_id: 'asgn-b-1', order_index: 3, task_type: 'short_answer',
    question: 'Периметр прямоугольника равен 56 см. Длина одной стороны в 3 раза больше другой. Найди площадь (кв. см).',
    correct_answer: '147', points: 4 },
  { id: 'task-b-5', assignment_id: 'asgn-b-1', order_index: 4, task_type: 'open_ended',
    question: 'На острове живут 15 рыцарей и лжецов. Каждый написал: «Среди остальных не меньше 8 лжецов». Сколько лжецов на острове? Докажи свой ответ.',
    correct_answer: '', points: 6 },

  // ===== НЕДЕЛЯ 3: БАТЫРХАН — делимость (asgn-b-2) =====
  { id: 'task-b-6', assignment_id: 'asgn-b-2', order_index: 0, task_type: 'short_answer',
    question: 'Найди НОД(84, 126).',
    correct_answer: '42', points: 3 },
  { id: 'task-b-7', assignment_id: 'asgn-b-2', order_index: 1, task_type: 'short_answer',
    question: 'Найди НОК(12, 18).',
    correct_answer: '36', points: 3 },
  { id: 'task-b-8', assignment_id: 'asgn-b-2', order_index: 2, task_type: 'multiple_choice',
    question: 'Какое наименьшее натуральное число делится на 2, 3, 5 и 7 одновременно?',
    options: ['105', '210', '420', '630'], correct_answer: '210', points: 4 },
  { id: 'task-b-9', assignment_id: 'asgn-b-2', order_index: 3, task_type: 'short_answer',
    question: 'В мешке лежат 100 шариков с номерами от 1 до 100. Какое наименьшее количество шариков нужно вытащить, чтобы гарантированно нашлись два с суммой номеров 60?',
    correct_answer: '52', points: 5 },
  { id: 'task-b-10', assignment_id: 'asgn-b-2', order_index: 4, task_type: 'open_ended',
    question: 'Докажи, что произведение любых трёх последовательных натуральных чисел делится на 6.',
    correct_answer: '', points: 6 },

  // ===== НЕДЕЛЯ 4: МАРЖАН — ребусы (asgn-m-3) =====
  { id: 'task-m-10', assignment_id: 'asgn-m-3', order_index: 0, task_type: 'short_answer',
    question: 'Разгадай ребус: АБ + БА = 132. Чему равно А?',
    correct_answer: '6', points: 3 },
  { id: 'task-m-11', assignment_id: 'asgn-m-3', order_index: 1, task_type: 'short_answer',
    question: 'Продолжи закономерность: 2, 6, 12, 20, 30, ... Какое следующее число?',
    correct_answer: '42', points: 3 },
  { id: 'task-m-12', assignment_id: 'asgn-m-3', order_index: 2, task_type: 'multiple_choice',
    question: 'В примере КОШКА + КОШКА = СОБАКА. Какая цифра стоит на месте буквы К?',
    options: ['1', '2', '3', '4'], correct_answer: '1', points: 4 },
  { id: 'task-m-13', assignment_id: 'asgn-m-3', order_index: 3, task_type: 'short_answer',
    question: 'Найди число, если оно в 3 раза больше суммы своих цифр.',
    correct_answer: '27', points: 4 },
  { id: 'task-m-14', assignment_id: 'asgn-m-3', order_index: 4, task_type: 'open_ended',
    question: 'Расставь скобки и знаки +, -, ×, ÷ между цифрами 1 2 3 4 5, чтобы получить 100. Покажи решение.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 4: МАРЖАН — дроби (asgn-m-4) =====
  { id: 'task-m-15', assignment_id: 'asgn-m-4', order_index: 0, task_type: 'short_answer',
    question: 'Сравни дроби 3/7 и 5/9. Какая больше? Напиши в формате: 3/7 или 5/9',
    correct_answer: '5/9', points: 3 },
  { id: 'task-m-16', assignment_id: 'asgn-m-4', order_index: 1, task_type: 'short_answer',
    question: 'Вычисли: 2/5 + 3/10 = ? Ответ в виде несократимой дроби (числитель/знаменатель)',
    correct_answer: '7/10', points: 3 },
  { id: 'task-m-17', assignment_id: 'asgn-m-4', order_index: 2, task_type: 'multiple_choice',
    question: 'В бассейне 3/4 воды. Вылили 1/3 того, что было. Какая часть бассейна заполнена?',
    options: ['1/4', '1/2', '5/12', '7/12'], correct_answer: '1/2', points: 4 },
  { id: 'task-m-18', assignment_id: 'asgn-m-4', order_index: 3, task_type: 'open_ended',
    question: 'Мама разделила торт на 8 частей. Папа съел 3/8, мама — 2/8, а остальное дети. Какую часть торта съели дети? Покажи решение с рисунком.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 4: БАТЫРХАН — десятичные дроби (asgn-b-3) =====
  { id: 'task-b-11', assignment_id: 'asgn-b-3', order_index: 0, task_type: 'short_answer',
    question: 'Вычисли: 3.14 + 2.86 =',
    correct_answer: '6', points: 3 },
  { id: 'task-b-12', assignment_id: 'asgn-b-3', order_index: 1, task_type: 'short_answer',
    question: 'Расположи в порядке возрастания: 0.5, 0.05, 0.55, 0.505. Запиши через запятую.',
    correct_answer: '0.05, 0.5, 0.505, 0.55', points: 3 },
  { id: 'task-b-13', assignment_id: 'asgn-b-3', order_index: 2, task_type: 'multiple_choice',
    question: 'Какое число в 100 раз больше, чем 0.037?',
    options: ['0.37', '3.7', '37', '370'], correct_answer: '3.7', points: 3 },
  { id: 'task-b-14', assignment_id: 'asgn-b-3', order_index: 3, task_type: 'short_answer',
    question: 'Кенгуру прыгает на 1.5 м за один прыжок. Сколько прыжков нужно, чтобы преодолеть 12 метров?',
    correct_answer: '8', points: 4 },
  { id: 'task-b-15', assignment_id: 'asgn-b-3', order_index: 4, task_type: 'open_ended',
    question: 'Три друга купили пиццу за 15.90 тенге. Они хотят разделить счёт поровну. Сколько заплатит каждый? А если один из них положил 10 тенге, как остальные двое поделят остаток?',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 4: БАТЫРХАН — ребусы (asgn-b-4) =====
  { id: 'task-b-16', assignment_id: 'asgn-b-4', order_index: 0, task_type: 'short_answer',
    question: 'Разгадай: FEMO + 2023 = MATH. Чему равно F?',
    correct_answer: '7', points: 4 },
  { id: 'task-b-17', assignment_id: 'asgn-b-4', order_index: 1, task_type: 'short_answer',
    question: 'Известно, что A×B×C = 30, B×C×D = 90, C×D×E = 180. Найди A×C×E.',
    correct_answer: '60', points: 5 },
  { id: 'task-b-18', assignment_id: 'asgn-b-4', order_index: 2, task_type: 'multiple_choice',
    question: 'В примере AB + BA = CBC, где A, B, C — разные цифры, чему равна C?',
    options: ['1', '2', '3', '4'], correct_answer: '1', points: 4 },
  { id: 'task-b-19', assignment_id: 'asgn-b-4', order_index: 3, task_type: 'open_ended',
    question: 'Расставь цифры от 1 до 9 в клетки таблицы 3×3, чтобы суммы по всем строкам, столбцам и диагоналям были равны. Нарисуй квадрат.',
    correct_answer: '', points: 6 },

  // ===== НЕДЕЛЯ 5: МАРЖАН — взвешивание (asgn-m-5) =====
  { id: 'task-m-19', assignment_id: 'asgn-m-5', order_index: 0, task_type: 'multiple_choice',
    question: 'Среди 9 одинаковых монет одна фальшивая (легче). За сколько взвешиваний на чашечных весах можно её найти?',
    options: ['1', '2', '3', '4'], correct_answer: '2', points: 3 },
  { id: 'task-m-20', assignment_id: 'asgn-m-5', order_index: 1, task_type: 'short_answer',
    question: 'Среди 27 монет одна фальшивая (легче). Какое минимальное число взвешиваний нужно, чтобы найти её?',
    correct_answer: '3', points: 4 },
  { id: 'task-m-21', assignment_id: 'asgn-m-5', order_index: 2, task_type: 'open_ended',
    question: 'Есть 8 монет. Одна из них фальшивая и отличается по весу (может быть легче или тяжелее). Как за 3 взвешивания найти фальшивую и определить, легче она или тяжелее? Опиши стратегию.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 5: МАРЖАН — переливание (asgn-m-6) =====
  { id: 'task-m-22', assignment_id: 'asgn-m-6', order_index: 0, task_type: 'short_answer',
    question: 'Есть кувшины 5 л и 3 л. Нужно отмерить ровно 4 литра. Какое минимальное число переливаний?',
    correct_answer: '6', points: 4 },
  { id: 'task-m-23', assignment_id: 'asgn-m-6', order_index: 1, task_type: 'multiple_choice',
    question: 'Есть кувшины 7 л и 5 л. Можно ли отмерить ровно 1 литр?',
    options: ['Да, за 4 шага', 'Да, за 6 шагов', 'Да, за 8 шагов', 'Нет, невозможно'],
    correct_answer: 'Да, за 4 шага', points: 3 },
  { id: 'task-m-24', assignment_id: 'asgn-m-6', order_index: 2, task_type: 'open_ended',
    question: 'Есть 3 кувшина: 8 л (полный), 5 л (пустой), 3 л (пустой). Раздели 8 литров на две равные части по 4 литра. Напиши все шаги.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 5: МАРЖАН — делимость (asgn-m-7) =====
  { id: 'task-m-25', assignment_id: 'asgn-m-7', order_index: 0, task_type: 'multiple_choice',
    question: 'Какое число делится и на 3, и на 5, и на 2?',
    options: ['15', '25', '30', '45'], correct_answer: '30', points: 3 },
  { id: 'task-m-26', assignment_id: 'asgn-m-7', order_index: 1, task_type: 'short_answer',
    question: 'Сколько двузначных чисел делится на 7?',
    correct_answer: '13', points: 4 },
  { id: 'task-m-27', assignment_id: 'asgn-m-7', order_index: 2, task_type: 'short_answer',
    question: 'Число 3□5 делится на 9. Какую цифру нужно поставить вместо □?',
    correct_answer: '1', points: 3 },

  // ===== НЕДЕЛЯ 5: БАТЫРХАН — геометрия (asgn-b-5) =====
  { id: 'task-b-20', assignment_id: 'asgn-b-5', order_index: 0, task_type: 'short_answer',
    question: 'В треугольнике два угла равны 50° и 70°. Чему равен третий угол?',
    correct_answer: '60', points: 3 },
  { id: 'task-b-21', assignment_id: 'asgn-b-5', order_index: 1, task_type: 'multiple_choice',
    question: 'Внешний угол треугольника равен 120°. Один из не смежных с ним углов равен 50°. Чему равен второй не смежный угол?',
    options: ['50°', '60°', '70°', '80°'], correct_answer: '70°', points: 4 },
  { id: 'task-b-22', assignment_id: 'asgn-b-5', order_index: 2, task_type: 'short_answer',
    question: 'В равнобедренном треугольнике угол при основании 70°. Чему равен угол при вершине?',
    correct_answer: '40', points: 3 },
  { id: 'task-b-23', assignment_id: 'asgn-b-5', order_index: 3, task_type: 'open_ended',
    question: 'Можно ли разрезать прямоугольник 4×9 на два одинаковых куска и сложить из них квадрат? Если да — нарисуй разрез. Если нет — объясни почему.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 5: БАТЫРХАН — движение (asgn-b-6) =====
  { id: 'task-b-24', assignment_id: 'asgn-b-6', order_index: 0, task_type: 'short_answer',
    question: 'Катер идёт по течению со скоростью 18 км/ч, а против — 12 км/ч. Какова скорость течения?',
    correct_answer: '3', points: 3 },
  { id: 'task-b-25', assignment_id: 'asgn-b-6', order_index: 1, task_type: 'short_answer',
    question: 'Лодка прошла по течению 30 км за 2 часа. Скорость течения 3 км/ч. Какова собственная скорость лодки?',
    correct_answer: '12', points: 4 },
  { id: 'task-b-26', assignment_id: 'asgn-b-6', order_index: 2, task_type: 'open_ended',
    question: 'Плот плывёт от A до B за 6 часов. Катер идёт от A до B за 2 часа, а от B до A — за 3 часа. Найди скорость катера в стоячей воде и скорость течения. Напиши решение.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 5: БАТЫРХАН — переливания (asgn-b-7) =====
  { id: 'task-b-27', assignment_id: 'asgn-b-7', order_index: 0, task_type: 'short_answer',
    question: 'Среди 81 монеты одна фальшивая (легче). Минимальное число взвешиваний на чашечных весах?',
    correct_answer: '4', points: 4 },
  { id: 'task-b-28', assignment_id: 'asgn-b-7', order_index: 1, task_type: 'multiple_choice',
    question: 'Есть кувшины 7 л и 3 л. Нужно отмерить 5 литров. Возможно ли это?',
    options: ['Да, за 4 шага', 'Да, за 6 шагов', 'Да, за 8 шагов', 'Нет, невозможно'],
    correct_answer: 'Да, за 4 шага', points: 3 },
  { id: 'task-b-29', assignment_id: 'asgn-b-7', order_index: 2, task_type: 'open_ended',
    question: 'Дорожная карта выглядит в виде квадрата 3×3 (сторона клетки 150 м). Дворник из точки А должен убрать каждую улицу и вернуться. Найди кратчайший маршрут (в метрах). Нарисуй маршрут.',
    correct_answer: '', points: 6 },

  // ===== НЕДЕЛЯ 6: МАРЖАН — логика «кто есть кто» (asgn-m-8) =====
  { id: 'task-m-28', assignment_id: 'asgn-m-8', order_index: 0, task_type: 'multiple_choice',
    question: 'Аня, Боря и Витя заняли 1, 2 и 3 место. Аня не была первой, Боря не был ни первым, ни третьим. Кто победил?',
    options: ['Аня', 'Боря', 'Витя'], correct_answer: 'Витя', points: 3 },
  { id: 'task-m-29', assignment_id: 'asgn-m-8', order_index: 1, task_type: 'short_answer',
    question: 'Три друга — врач, учитель и программист. Врач не Саша. Учитель не Саша и не Петя. Кто программист?',
    correct_answer: 'Саша', points: 3 },
  { id: 'task-m-30', assignment_id: 'asgn-m-8', order_index: 2, task_type: 'open_ended',
    question: 'Четыре девочки ели фрукты: яблоко, грушу, банан и апельсин. Маша не ела яблоко и банан. Даша ела грушу. Саша не ела банан. Кто ел что? Составь таблицу.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 6: МАРЖАН — чётность (asgn-m-9) =====
  { id: 'task-m-31', assignment_id: 'asgn-m-9', order_index: 0, task_type: 'multiple_choice',
    question: 'Сумма пяти нечётных чисел:',
    options: ['Всегда чётная', 'Всегда нечётная', 'Может быть любой'],
    correct_answer: 'Всегда нечётная', points: 3 },
  { id: 'task-m-32', assignment_id: 'asgn-m-9', order_index: 1, task_type: 'short_answer',
    question: 'Произведение чётного числа на нечётное — чётное или нечётное? Ответь одним словом.',
    correct_answer: 'чётное', points: 3 },
  { id: 'task-m-33', assignment_id: 'asgn-m-9', order_index: 2, task_type: 'open_ended',
    question: 'На шахматной доске 8×8 вырезали 2 противоположных угловых клетки. Можно ли покрыть оставшиеся клетки доминошками 1×2? Объясни почему.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 6: МАРЖАН — графы (asgn-m-10) =====
  { id: 'task-m-34', assignment_id: 'asgn-m-10', order_index: 0, task_type: 'multiple_choice',
    question: 'В комнате 5 человек, каждый пожал руку каждому. Сколько рукопожатий произошло?',
    options: ['5', '10', '15', '20'], correct_answer: '10', points: 3 },
  { id: 'task-m-35', assignment_id: 'asgn-m-10', order_index: 1, task_type: 'short_answer',
    question: 'Можно ли нарисовать фигуру «домик» (квадрат с треугольной крышей) одним росчерком, не отрывая руки? Ответь: да или нет.',
    correct_answer: 'да', points: 3 },
  { id: 'task-m-36', assignment_id: 'asgn-m-10', order_index: 2, task_type: 'open_ended',
    question: 'В классе 6 человек. Каждый дружит ровно с 3 другими. Нарисуй граф дружбы (точки — люди, линии — дружба). Возможно ли это?',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 6: БАТЫРХАН — чётность/делимость (asgn-b-8) =====
  { id: 'task-b-30', assignment_id: 'asgn-b-8', order_index: 0, task_type: 'multiple_choice',
    question: 'Произведение 100 последовательных натуральных чисел делится на:',
    options: ['100!', '2^50', 'Оба варианта', 'Ни один'], correct_answer: 'Оба варианта', points: 4 },
  { id: 'task-b-31', assignment_id: 'asgn-b-8', order_index: 1, task_type: 'short_answer',
    question: 'Сумма 2026 нечётных чисел — чётная или нечётная? Одним словом.',
    correct_answer: 'чётная', points: 3 },
  { id: 'task-b-32', assignment_id: 'asgn-b-8', order_index: 2, task_type: 'open_ended',
    question: 'В ряд написаны числа от 1 до 100. Можно ли расставить между ними знаки + и −, чтобы получился 0? Докажи или опровергни.',
    correct_answer: '', points: 6 },

  // ===== НЕДЕЛЯ 6: БАТЫРХАН — смеси (asgn-b-9) =====
  { id: 'task-b-33', assignment_id: 'asgn-b-9', order_index: 0, task_type: 'short_answer',
    question: 'Смешали 2 кг конфет по 800 тг/кг и 3 кг по 600 тг/кг. Какова цена 1 кг смеси (в тг)?',
    correct_answer: '680', points: 3 },
  { id: 'task-b-34', assignment_id: 'asgn-b-9', order_index: 1, task_type: 'short_answer',
    question: 'Сплав 20% меди весит 5 кг. Сколько кг чистой меди в нём?',
    correct_answer: '1', points: 3 },
  { id: 'task-b-35', assignment_id: 'asgn-b-9', order_index: 2, task_type: 'open_ended',
    question: 'Есть два раствора соли: 10% и 30%. Сколько литров каждого нужно смешать, чтобы получить 10 литров 18% раствора? Напиши решение.',
    correct_answer: '', points: 5 },

  // ===== НЕДЕЛЯ 6: БАТЫРХАН — раскраски (asgn-b-10) =====
  { id: 'task-b-36', assignment_id: 'asgn-b-10', order_index: 0, task_type: 'multiple_choice',
    question: 'На шахматной доске 8×8 вырезали 2 противоположных угловых клетки. Можно ли покрыть остальное доминошками 1×2?',
    options: ['Да', 'Нет', 'Только если доска 6×6', 'Зависит от расположения'],
    correct_answer: 'Нет', points: 4 },
  { id: 'task-b-37', assignment_id: 'asgn-b-10', order_index: 1, task_type: 'short_answer',
    question: 'Сколько клеток нужно закрасить на доске 4×4, чтобы в каждой строке и каждом столбце было ровно 2 закрашенных?',
    correct_answer: '8', points: 3 },
  { id: 'task-b-38', assignment_id: 'asgn-b-10', order_index: 2, task_type: 'open_ended',
    question: 'Можно ли покрасить клетки доски 5×5 в 3 цвета так, чтобы никакие 2 соседние клетки (по стороне) не были одного цвета? Нарисуй пример или докажи невозможность.',
    correct_answer: '', points: 6 },
]

// === БОНУСНАЯ СИСТЕМА: конфигурация ===
export const BONUS_CONFIG = {
  // Баллы за задания
  points_per_correct: 10,        // правильный ответ
  points_per_attempt: 2,         // попытка (даже неверная)
  points_per_open_ended: 5,      // отправка open_ended задачи
  points_perfect_bonus: 15,      // бонус за 100% в задании
  streak_bonus_3: 20,            // бонус за 3 дня подряд
  streak_bonus_7: 50,            // бонус за 7 дней подряд

  // Уровни
  levels: [
    { name: 'Новичок', min_points: 0, emoji: '🌱' },
    { name: 'Ученик', min_points: 30, emoji: '📚' },
    { name: 'Решатель', min_points: 80, emoji: '🧩' },
    { name: 'Мастер', min_points: 150, emoji: '⭐' },
    { name: 'Олимпиадник', min_points: 250, emoji: '🏆' },
    { name: 'Чемпион FEMO', min_points: 400, emoji: '🥇' },
  ],

  // Бейджи
  badges: {
    first_task:         { name: 'Первый шаг',      emoji: '🎯', description: 'Решил первую задачу' },
    streak_3:           { name: '3 дня подряд',     emoji: '🔥', description: 'Решал задачи 3 дня подряд' },
    streak_7:           { name: 'Неделя огня',      emoji: '💪', description: '7 дней подряд!' },
    perfect_assignment: { name: 'Без ошибок',       emoji: '💯', description: 'Все верно в одном задании' },
    speed_demon:        { name: 'Молния',           emoji: '⚡', description: 'Решил 5 задач за 10 минут' },
    points_50:          { name: 'Полтинник',        emoji: '🎲', description: 'Набрал 50 баллов' },
    points_100:         { name: 'Сотка',            emoji: '💎', description: 'Набрал 100 баллов' },
    points_250:         { name: 'Четверть тысячи',  emoji: '🌟', description: 'Набрал 250 баллов' },
    olympiad_ready:     { name: 'Готов к FEMO',     emoji: '🏅', description: 'Прошёл все задания перед олимпиадой' },
  } as Record<string, { name: string; emoji: string; description: string }>,
}
