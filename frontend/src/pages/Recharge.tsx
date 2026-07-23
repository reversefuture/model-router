import { useEffect, useState } from 'react'
import { useAuth } from '../api/auth'
import { api } from '../api/client'

interface Record {
  id: string
  amount: number
  method: string
  status: string
  created_at: string
}

const PRESETS = [10, 50, 100, 500, 1000]

export default function Recharge() {
  const { user, refreshUser } = useAuth()
  const [amount, setAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.rechargeRecords().then(setRecords)
  }, [])

  const handleRecharge = async () => {
    const amt = customAmount ? parseFloat(customAmount) : amount
    if (!amt || amt <= 0) { setMsg('请输入有效金额'); return }
    setLoading(true)
    setMsg('')
    try {
      await api.recharge(amt)
      setMsg(`充值 ¥${amt} 成功！`)
      refreshUser()
      api.rechargeRecords().then(setRecords)
    } catch (err: any) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">充值</h1>
      <p className="text-gray-500 mb-8">当前余额：<span className="font-semibold text-primary-600">¥{(user?.balance ?? 0).toFixed(2)}</span></p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="font-semibold mb-4">选择充值金额</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {PRESETS.map(p => (
            <button key={p} onClick={() => { setAmount(p); setCustomAmount('') }}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition ${
                amount === p && !customAmount ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300 text-gray-600'
              }`}>
              ¥{p}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-sm text-gray-500 mb-1 block">自定义金额</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">¥</span>
            <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="输入金额"
              className="border rounded-lg px-3 py-2 text-sm w-32 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button onClick={handleRecharge} disabled={loading}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {loading ? '处理中...' : `确认充值 ¥${customAmount ? parseFloat(customAmount) : amount}`}
        </button>
        {msg && <p className={`mt-3 text-sm ${msg.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        <p className="text-xs text-gray-400 mt-3">当前为 Mock 充值，实际支付对接中</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">充值记录</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">金额</th>
              <th className="pb-2 font-medium">方式</th>
              <th className="pb-2 font-medium">状态</th>
              <th className="pb-2 font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? records.map(r => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2.5 text-green-600 font-medium">+¥{r.amount}</td>
                <td className="py-2.5">{r.method}</td>
                <td className="py-2.5">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{r.status}</span>
                </td>
                <td className="py-2.5 text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400">暂无充值记录</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
