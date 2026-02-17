import type {
  Student, Schedule, LessonPlan, KnowledgeBase,
  OlympiadEvent, LessonResult, WeeklyReport, Assignment, AssignmentTask,
  LessonCategory,
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

// === ДОМАШНИЕ ЗАДАНИЯ (олимпиадный уровень) ===
export const seedAssignments: Assignment[] = [
  {
    id: 'asgn-m-1',
    student_id: 'student-marzhan',
    lesson_plan_id: 'lp-m-6',
    title: 'Олимпиадная геометрия + ребусы',
    description: 'Задачи уровня FEMO 3-4 класс',
    due_date: '2026-02-25',
    is_active: true,
    created_at: '2026-02-17T18:00:00Z',
  },
  {
    id: 'asgn-b-1',
    student_id: 'student-batyrkhan',
    lesson_plan_id: 'lp-b-6',
    title: 'FEMO: делимость и логика',
    description: 'Олимпиадные задачи уровня FEMO 5-6 класс',
    due_date: '2026-02-25',
    is_active: true,
    created_at: '2026-02-17T18:00:00Z',
  },
]

export const seedAssignmentTasks: AssignmentTask[] = [
  // Маржан — олимпиадные задачи (по типу фото)
  { id: 'task-m-1', assignment_id: 'asgn-m-1', order_index: 0, task_type: 'multiple_choice',
    question: 'Какой из квадратов поделён на две неравные по площади фигуры?\n(А) — разрезан по диагонали\n(Б) — разрезан по средней линии\n(В) — разрезан на 4 равных квадрата, один закрашен\n(Г) — разрезан зигзагом\n(Д) — разрезан не по центру',
    options: ['А', 'Б', 'В', 'Г', 'Д'], correct_answer: 'Д', points: 3 },
  { id: 'task-m-2', assignment_id: 'asgn-m-1', order_index: 1, task_type: 'multiple_choice',
    question: 'Если в некотором месяце 5 суббот, то в этом месяце не может быть 5:',
    options: ['вторников', 'воскресений', 'четвергов', 'пятниц'], correct_answer: 'вторников', points: 3 },
  { id: 'task-m-3', assignment_id: 'asgn-m-1', order_index: 2, task_type: 'short_answer',
    question: 'У Маши 24 конфеты. Она отдала брату 1/3 всех конфет. Сколько конфет осталось у Маши?',
    correct_answer: '16', points: 3 },
  { id: 'task-m-4', assignment_id: 'asgn-m-1', order_index: 3, task_type: 'short_answer',
    question: 'Периметр прямоугольника 24 см. Длина на 4 см больше ширины. Найди площадь.',
    correct_answer: '32', points: 4 },
  { id: 'task-m-5', assignment_id: 'asgn-m-1', order_index: 4, task_type: 'open_ended',
    question: 'Маша, Даша и Саша съели вместе 18 конфет. Маша съела 5 конфет. Даша съела на 2 конфеты больше, чем Маша. Сколько конфет съела Саша? Напиши решение.',
    correct_answer: '', points: 4 },

  // Батырхан — олимпиадные задачи FEMO-уровня (по типу фото)
  { id: 'task-b-1', assignment_id: 'asgn-b-1', order_index: 0, task_type: 'multiple_choice',
    question: 'В числовом примере 6ДБ+9 = ГДЕ буквами А, Б, В, Г, Д и Е обозначают шесть разных цифр. Какая цифра обозначена буквой Д?',
    options: ['1', '3', '5', '7'], correct_answer: '5', points: 4 },
  { id: 'task-b-2', assignment_id: 'asgn-b-1', order_index: 1, task_type: 'short_answer',
    question: 'На острове рыцарей и лжецов вечером несколько местных жителей собрались за круглым столом. Каждый сказал: «Мои соседи — лжец и рыцарь». Сколько за столом рыцарей, если собрались 9 человек?',
    correct_answer: '6', points: 5 },
  { id: 'task-b-3', assignment_id: 'asgn-b-1', order_index: 2, task_type: 'short_answer',
    question: 'В мешке лежат 100 шариков с номерами от 1 до 100. Какое наименьшее количество шариков нужно вытащить в темноте, чтобы среди них гарантированно нашлись два таких, что сумма их номеров равна 60?',
    correct_answer: '52', points: 5 },
  { id: 'task-b-4', assignment_id: 'asgn-b-1', order_index: 3, task_type: 'short_answer',
    question: 'Известно, что A×B×C=30, B×C×D=90 и C×D×E=180. Каково значение A×C×E?',
    correct_answer: '60', points: 5 },
  { id: 'task-b-5', assignment_id: 'asgn-b-1', order_index: 4, task_type: 'open_ended',
    question: 'Дорожная карта улиц одного из районов города выглядит в виде квадрата 3×3. Сторона каждого маленького квадрата равна 150 метрам. Дворник начинает уборку из точки А и должен убрать каждую улицу, пока наконец не вернётся в А. Какое самое короткое расстояние в метрах он должен пройти? Нарисуй маршрут.',
    correct_answer: '', points: 6 },
]
