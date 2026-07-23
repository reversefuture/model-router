import { Link } from 'react-router-dom'
import { useAuth } from '../api/auth'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">大模型 API 统一中转平台</h1>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            一站式接入 GPT-4o、Claude 3、DeepSeek 等主流大模型。统一 API 接口、按量计费、稳定可靠。
          </p>
          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-medium hover:bg-primary-50 transition">进入控制台</Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-medium hover:bg-primary-50 transition">免费注册</Link>
                <Link to="/login" className="border border-white/40 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition">登录</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">为什么选择 Model Router</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: '统一 API', desc: '一套 OpenAI 兼容接口，调用所有主流模型，无需切换 SDK' },
            { title: '按量计费', desc: '按实际 Token 用量计费，无月费无最低消费，用多少付多少' },
            { title: '稳定可靠', desc: '多上游自动容灾，99.9% SLA 保障，P99 延迟低于 500ms' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">支持的主流模型</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {['GPT-4o', 'GPT-4o Mini', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku', 'DeepSeek Chat', 'DeepSeek Reasoner', 'GPT-4 Turbo'].map(m => (
              <div key={m} className="bg-gray-50 rounded-lg py-3 px-4 font-medium text-gray-700">{m}</div>
            ))}
          </div>
          <Link to="/models" className="inline-block mt-8 text-primary-600 hover:text-primary-700 font-medium">查看完整列表与价格 →</Link>
        </div>
      </section>
    </div>
  )
}
