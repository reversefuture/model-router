import { useEffect, useState } from 'react'
import { useAuth } from '../api/auth'
import { api } from '../api/client'

interface Stats {
  total_calls: number
  total_cost: number
  total_input_tokens: number
  total_output_tokens: number
  recent_records: Array<{
    id: string
    model_name: string
    input_tokens: number
    output_tokens: number
    cost: number
    created_at: string
  }>
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.usageStats().then(setStats)
    refreshUser()
  }, [])

  const cards = [
    { label: '账户余额', value: `¥${(user?.balance ?? 0).toFixed(2)}`, color: 'text-green-600' },
    { label: '总调用次数', value: String(stats?.total_calls ?? 0), color: 'text-primary-600' },
    { label: '总消耗', value: `¥${(stats?.total_cost ?? 0).toFixed(4)}`, color: 'text-orange-600' },
    { label: '总 Token', value: ((stats?.total_input_tokens ?? 0) + (stats?.total_output_tokens ?? 0)).toLocaleString(), color: 'text-purple-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">控制台</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">最近调用记录</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">模型</th>
                <th className="pb-2 font-medium">输入 Token</th>
                <th className="pb-2 font-medium">输出 Token</th>
                <th className="pb-2 font-medium">费用</th>
                <th className="pb-2 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_records?.length ? stats.recent_records.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2.5">{r.model_name}</td>
                  <td className="py-2.5">{r.input_tokens.toLocaleString()}</td>
                  <td className="py-2.5">{r.output_tokens.toLocaleString()}</td>
                  <td className="py-2.5">¥{r.cost.toFixed(6)}</td>
                  <td className="py-2.5 text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">暂无调用记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
