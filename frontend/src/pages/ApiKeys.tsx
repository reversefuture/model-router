import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface ApiKey {
  id: string
  name: string
  key: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showNew, setShowNew] = useState(false)

  const load = () => api.listKeys().then(setKeys)

  useEffect(() => { load() }, [])

  const create = async () => {
    await api.createKey(newKeyName || undefined)
    setNewKeyName('')
    setShowNew(false)
    load()
  }

  const toggle = async (id: string) => {
    await api.toggleKey(id)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('确定删除此 API Key？')) return
    await api.deleteKey(id)
    load()
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    alert('已复制')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">API Key 管理</h1>
        <button onClick={() => setShowNew(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition">
          创建 Key
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <label className="block text-sm font-medium mb-2">Key 名称（选填）</label>
          <div className="flex gap-2">
            <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
              placeholder="例如：生产环境" className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <button onClick={create} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition">创建</button>
            <button onClick={() => setShowNew(false)} className="text-gray-500 px-3 text-sm hover:text-gray-700">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {keys.length === 0 && <p className="text-center text-gray-400 py-8">暂无 API Key，点击上方按钮创建</p>}
        {keys.map(k => (
          <div key={k.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{k.name}</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {k.is_active ? '启用' : '禁用'}
                </span>
                <button onClick={() => toggle(k.id)} className="text-xs text-gray-500 hover:text-primary-600">
                  {k.is_active ? '禁用' : '启用'}
                </button>
                <button onClick={() => remove(k.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono">
              <span className="flex-1 truncate">{k.key}</span>
              <button onClick={() => copyKey(k.key)} className="text-primary-600 hover:text-primary-700 text-xs shrink-0">复制</button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              创建于 {new Date(k.created_at).toLocaleDateString()}
              {k.last_used_at && ` · 最后使用 ${new Date(k.last_used_at).toLocaleString()}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
