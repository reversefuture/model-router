const BASE = ''

async function request(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('未登录')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '请求失败')
  return data
}

export const api = {
  // 认证
  register: (body: { email: string; password: string; nickname?: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/auth/me'),

  // API Keys
  listKeys: () => request('/api/keys'),
  createKey: (name?: string) =>
    request('/api/keys', { method: 'POST', body: JSON.stringify({ name: name || '' }) }),
  deleteKey: (id: string) =>
    request(`/api/keys/${id}`, { method: 'DELETE' }),
  toggleKey: (id: string) =>
    request(`/api/keys/${id}/toggle`, { method: 'POST' }),

  // 模型
  listModels: () => request('/api/models'),

  // 订单/计费
  recharge: (amount: number) =>
    request('/api/orders/recharge', { method: 'POST', body: JSON.stringify({ amount }) }),
  rechargeRecords: () => request('/api/orders/recharge-records'),
  usageStats: () => request('/api/orders/usage-stats'),

  // 管理
  adminUsers: () => request('/api/admin/users'),
  adminStats: () => request('/api/admin/stats'),
}
