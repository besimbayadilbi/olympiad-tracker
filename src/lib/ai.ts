// AI-сервис через Anthropic Claude API

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

interface GenerateQuestionsParams {
  topic: string
  grade: number
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  type: 'multiple_choice' | 'short_answer' | 'open_ended'
}

interface GeneratedQuestion {
  question: string
  options?: string[]
  correct_answer: string
  points: number
}

interface AutoFillParams {
  studentName: string
  grade: number
  topic: string
  briefNote: string // краткое описание урока от учителя
}

interface AutoFillResult {
  understanding: number
  tasks_solved: number
  tasks_correct: number
  homework_given: string
  teacher_comment_private: string
  teacher_comment_parent: string
}

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('API ключ не настроен. Добавьте VITE_ANTHROPIC_API_KEY в .env')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API ошибка: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

export async function generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
  const systemPrompt = `Ты — опытный составитель олимпиадных задач по математике для ${params.grade} класса.
Генерируй задачи в формате JSON массива. Каждая задача должна быть интересной и развивать логическое мышление.
Уровень сложности: ${params.difficulty === 'easy' ? 'лёгкий' : params.difficulty === 'medium' ? 'средний' : 'сложный'}.
Тип задач: ${params.type === 'multiple_choice' ? 'с вариантами ответа (4 варианта)' : params.type === 'short_answer' ? 'с коротким числовым ответом' : 'с развёрнутым решением'}.
Отвечай ТОЛЬКО JSON массивом, без markdown, без комментариев.`

  const userMessage = `Сгенерируй ${params.count} задач(и) по теме "${params.topic}" для ${params.grade} класса.
Формат каждой задачи:
{
  "question": "текст вопроса",
  ${params.type === 'multiple_choice' ? '"options": ["A вариант", "B вариант", "C вариант", "D вариант"],' : ''}
  "correct_answer": "правильный ответ",
  "points": ${params.difficulty === 'easy' ? 1 : params.difficulty === 'medium' ? 2 : 3}
}`

  const response = await callClaude(systemPrompt, userMessage)

  try {
    // Пробуем извлечь JSON из ответа
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch {
    console.error('Не удалось распарсить ответ AI:', response)
    throw new Error('Не удалось распарсить ответ AI')
  }
}

export async function autoFillLessonResult(params: AutoFillParams): Promise<AutoFillResult> {
  const systemPrompt = `Ты — помощник учителя олимпиадной математики. На основе краткой заметки учителя об уроке, заполни карточку урока.
Ученик: ${params.studentName}, ${params.grade} класс.
Тема урока: ${params.topic}.
Отвечай ТОЛЬКО JSON объектом, без markdown, без комментариев.`

  const userMessage = `Заметка учителя: "${params.briefNote}"

Заполни карточку:
{
  "understanding": <число 1-5, оценка понимания>,
  "tasks_solved": <число, сколько задач решали>,
  "tasks_correct": <число, сколько верно>,
  "homework_given": "описание д/з",
  "teacher_comment_private": "заметка для себя",
  "teacher_comment_parent": "комментарий для родителя (позитивный, ободряющий)"
}`

  const response = await callClaude(systemPrompt, userMessage)

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch {
    console.error('Не удалось распарсить ответ AI:', response)
    throw new Error('Не удалось распарсить ответ AI')
  }
}

export function isAIConfigured(): boolean {
  return !!ANTHROPIC_API_KEY
}
