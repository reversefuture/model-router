import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Model {
  id: string
  name: string
  display_name: string
  provider: string
  input_price: number
  output_price: number
  unit: string
  is_popular: boolean
  description: string
}

const PROVIDER_BADGE: Record<string, string> = {
  openai: 'bg-green-100 text-green-700',
  anthropic: 'bg-purple-100 text-purple-700',
  deepseek: 'bg-blue-100 text-blue-700',
}

export default function Models() {
  const [models, setModels] = useState<Model[]>([])

  useEffect(() => {
    api.listModels().then(setModels)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">模型广场</h1>
      <p className="text-gray-500 mb-8">选择适合你的模型，按实际 Token 用量计费</p>

      <div className="grid md:grid-cols-2 gap-4">
        {models.map(m => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{m.display_name}</h3>
                <span className="text-xs text-gray-400 font-mono">{m.name}</span>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROVIDER_BADGE[m.provider] || 'bg-gray-100 text-gray-600'}`}>
                  {m.provider}
                </span>
                {m.is_popular && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">热门</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">输入价格</span>
                <div className="font-medium">¥{m.input_price}/{m.unit === 'per_1k_tokens' ? '1K tokens' : m.unit}</div>
              </div>
              <div>
                <span className="text-gray-400">输出价格</span>
                <div className="font-medium">¥{m.output_price}/{m.unit === 'per_1k_tokens' ? '1K tokens' : m.unit}</div>
              </div>
            </div>
            {m.description && <p className="text-xs text-gray-400 mt-3">{m.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
