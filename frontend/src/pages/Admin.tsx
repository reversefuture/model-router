import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface AdminStats {
  user_count: number
  total_recharge: number
  total_usage: number
}

interface User {
  id: string
  email: string
  nickname: string
  balance: number
  is_admin: boolean
  is_active: boolean
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.adminStats().then(setStats)
    api.adminUsers().then(setUsers)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500">用户数</div>
              <div className="text-xl font-bold text-primary-600">{stats.user_count}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500">总充值</div>
              <div className="text-xl font-bold text-green-600">¥{stats.total_recharge.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500">总消耗</div>
              <div className="text-xl font-bold text-orange-600">¥{stats.total_usage.toFixed(2)}</div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">用户列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">邮箱</th>
                <th className="pb-2 font-medium">昵称</th>
                <th className="pb-2 font-medium">余额</th>
                <th className="pb-2 font-medium">管理员</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2.5">{u.email}</td>
                  <td className="py-2.5">{u.nickname || '-'}</td>
                  <td className="py-2.5">¥{u.balance.toFixed(2)}</td>
                  <td className="py-2.5">{u.is_admin ? '✅' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
