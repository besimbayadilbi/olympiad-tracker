import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { BONUS_CONFIG } from '@/lib/seedData'
import { ArrowLeft, Star, ShoppingBag, Check, Lock } from 'lucide-react'

export default function RewardShopPage() {
  const studentId = useAuthStore((s) => s.studentId)
  const { getStudentAvailablePoints, getStudentPoints, getStudentSpentPoints, redeemReward, rewardRedemptions } = useDataStore()
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null)

  const available = studentId ? getStudentAvailablePoints(studentId) : 0
  const total = studentId ? getStudentPoints(studentId) : 0
  const spent = studentId ? getStudentSpentPoints(studentId) : 0

  const myRedemptions = rewardRedemptions.filter((r) => r.student_id === studentId)

  const handleRedeem = (rewardId: string) => {
    if (!studentId) return
    const success = redeemReward(rewardId, studentId)
    if (success) {
      setJustRedeemed(rewardId)
      setTimeout(() => setJustRedeemed(null), 2000)
    }
  }

  const getRedemptionCount = (rewardId: string) => {
    return myRedemptions.filter((r) => r.reward_id === rewardId).length
  }

  const categories = [
    { key: 'lesson', label: 'На уроке', emoji: '🎓' },
    { key: 'gift', label: 'Подарки', emoji: '🎁' },
    { key: 'privilege', label: 'Привилегии', emoji: '👑' },
  ]

  return (
    <div className="space-y-4">
      {/* Хедер */}
      <div className="flex items-center gap-3">
        <Link to="/student" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            Магазин наград
          </h1>
        </div>
      </div>

      {/* Баланс */}
      <div className="bg-gradient-to-r from-accent to-yellow-400 rounded-2xl p-4 text-white">
        <p className="text-sm text-white/80">Твой баланс</p>
        <div className="flex items-center gap-2 mt-1">
          <Star className="w-6 h-6 fill-white" />
          <span className="text-3xl font-bold">{available}</span>
          <span className="text-sm text-white/70">баллов</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-white/60">
          <span>Заработано: {total}</span>
          <span>Потрачено: {spent}</span>
        </div>
      </div>

      {/* Награды по категориям */}
      {categories.map((cat) => {
        const rewards = BONUS_CONFIG.rewards.filter((r) => r.category === cat.key)
        if (rewards.length === 0) return null

        return (
          <div key={cat.key}>
            <h2 className="font-bold text-sm text-primary mb-2 flex items-center gap-1.5">
              <span>{cat.emoji}</span> {cat.label}
            </h2>
            <div className="space-y-2">
              {rewards.map((reward) => {
                const canAfford = available >= reward.cost
                const count = getRedemptionCount(reward.id)
                const wasJustRedeemed = justRedeemed === reward.id

                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-xl border p-4 transition ${
                      canAfford ? 'border-border hover:shadow-md' : 'border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{reward.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{reward.title}</h3>
                          {count > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-success/10 text-success rounded-md font-medium">
                              x{count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{reward.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 text-sm font-bold text-accent">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {reward.cost}
                        </div>
                        {wasJustRedeemed ? (
                          <div className="px-3 py-1.5 bg-success text-white rounded-lg text-xs font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Получено!
                          </div>
                        ) : canAfford ? (
                          <button
                            onClick={() => handleRedeem(reward.id)}
                            className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-light transition"
                          >
                            Купить
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg text-xs font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Ещё {reward.cost - available} б.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Покупки */}
      {myRedemptions.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-primary mb-2">Мои покупки</h3>
          <div className="space-y-1.5">
            {myRedemptions.map((r) => {
              const reward = BONUS_CONFIG.rewards.find((rw) => rw.id === r.reward_id)
              if (!reward) return null
              return (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <span>{reward.emoji}</span>
                  <span className="flex-1">{reward.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    r.status === 'fulfilled' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {r.status === 'fulfilled' ? 'Получено' : 'Ждём урока'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
