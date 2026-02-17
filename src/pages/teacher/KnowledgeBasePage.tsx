import { useState, useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import { BookOpen, ChevronDown, Search } from 'lucide-react'

const importanceLabels = ['', 'Средняя', 'Высокая', 'Очень высокая']
const importanceColors = ['', 'bg-success/10 text-success', 'bg-warning/10 text-warning', 'bg-danger/10 text-danger']

export default function KnowledgeBasePage() {
  const { knowledgeBase, lessonPlans } = useDataStore()
  const [filterSection, setFilterSection] = useState<string>('all')
  const [search, setSearch] = useState('')

  const sections = useMemo(
    () => [...new Set(knowledgeBase.map((kb) => kb.section))],
    [knowledgeBase]
  )

  const filtered = useMemo(() => {
    let items = knowledgeBase
    if (filterSection !== 'all') items = items.filter((kb) => kb.section === filterSection)
    if (search) items = items.filter((kb) => kb.topic.toLowerCase().includes(search.toLowerCase()))
    return items
  }, [knowledgeBase, filterSection, search])

  // Связанные уроки для темы
  const getRelatedLessons = (topic: string) => {
    return lessonPlans.filter((lp) =>
      lp.topic.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
    ).length
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-accent" />
        База знаний
      </h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по темам..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div className="relative">
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="appearance-none bg-white border border-border rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Все разделы</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Раздел</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Тема</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">4 класс</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">5 класс</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">FEMO Вес.</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">FEMO Межд.</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Уроков</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kb) => (
                <tr key={kb.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs font-medium">
                      {kb.section}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{kb.topic}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{kb.grade_4_level}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{kb.grade_5_level}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${importanceColors[kb.femo_spring_importance]}`}>
                      {importanceLabels[kb.femo_spring_importance]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${importanceColors[kb.femo_intl_importance]}`}>
                      {importanceLabels[kb.femo_intl_importance]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary">
                    {getRelatedLessons(kb.topic)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-danger/20"></span> Очень высокая</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-warning/20"></span> Высокая</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-success/20"></span> Средняя</span>
      </div>
    </div>
  )
}
