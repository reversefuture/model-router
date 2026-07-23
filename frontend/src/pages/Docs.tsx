import { useAuth } from '../api/auth'

const CODE = {
  curl: `curl https://api.modelrouter.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-你的APIKey" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`,
  python: `from openai import OpenAI

client = OpenAI(
    api_key="sk-你的APIKey",
    base_url="https://api.modelrouter.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
  node: `import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: 'sk-你的APIKey',
    baseURL: 'https://api.modelrouter.com/v1'
})

const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
})
console.log(response.choices[0].message.content)`,
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-1.5 text-xs text-gray-400 border-b border-gray-700">{lang}</div>
      <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  )
}

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">API 文档</h1>
      <p className="text-gray-500 mb-8">使用 OpenAI 兼容 SDK 接入，只需更换 Base URL 和 API Key</p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">快速开始 — cURL</h2>
        <CodeBlock code={CODE.curl} lang="bash" />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Python (OpenAI SDK)</h2>
        <CodeBlock code={CODE.python} lang="python" />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Node.js (OpenAI SDK)</h2>
        <CodeBlock code={CODE.node} lang="javascript" />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">支持模型列表</h2>
        <p className="text-sm text-gray-500 mb-3">通过 GET /api/models 获取最新模型列表和价格</p>
        <div className="bg-gray-50 rounded-xl p-4 text-sm font-mono">
          GET https://api.modelrouter.com/api/models
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">注意事项</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
          <li>API Key 请妥善保管，不要泄露给第三方</li>
          <li>所有请求均按实际 Token 用量扣费，可在控制台查看明细</li>
          <li>速率限制：60 RPM / 100000 TPM（可在控制台查看当前限制）</li>
          <li>如遇问题，请联系管理员</li>
        </ul>
      </section>
    </div>
  )
}
