import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../api/auth'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = user
    ? [
        { to: '/dashboard', label: '控制台' },
        { to: '/models', label: '模型广场' },
        { to: '/docs', label: '文档' },
        { to: '/keys', label: 'API Keys' },
        { to: '/recharge', label: '充值' },
      ]
    : [
        { to: '/', label: '首页' },
        { to: '/models', label: '模型广场' },
        { to: '/docs', label: '文档' },
      ]

  const isActive = (path: string) =>
    location.pathname === path ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-primary-700">Model Router</Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className={`${isActive(l.to)} pb-1 transition`}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-gray-500">余额: <span className="text-primary-600 font-medium">¥{user.balance.toFixed(2)}</span></span>
                <span className="text-gray-700">{user.nickname || user.email}</span>
                {user.is_admin && <Link to="/admin" className="text-red-500 text-xs">管理</Link>}
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600">登录</Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700">注册</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-400">
        Model Router © 2026 — 大模型 API 中转站
      </footer>
    </div>
  )
}
