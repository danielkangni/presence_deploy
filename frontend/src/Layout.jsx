import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { api, clearToken, getToken } from "./api.js"
import { LayoutDashboard, Users, AlertTriangle, Settings, Calendar, LogOut, Bell, Plus, Shield } from "lucide-react"

// Sidebar Item Component
const SidebarItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all " +
      (isActive
        ? "bg-[#6C5DD3] text-white shadow-lg shadow-[#6C5DD3]/30"
        : "text-gray-400 hover:bg-white/5 hover:text-white")
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
)

export default function Layout({ children }) {
  const [me, setMe] = useState(null)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    const t = getToken()
    if (!t) return
    api.me().then(setMe).catch(() => { })
  }, [])

  const logout = () => { clearToken(); setMe(null); nav("/login"); }

  // If not logged in or purely public page (like login), we might want a simpler layout
  // But for now, let's wrap everything in the app shell or conditionally render the sidebar.
  // Assuming this layout is for the "App" part.

  const isAuthPage = loc.pathname === '/login' || loc.pathname === '/create-company';

  if (isAuthPage && !me) {
    return (
      <div className="min-h-screen bg-[#111] text-white p-4">
        <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5DD3] flex items-center justify-center">
              <Shield className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">KIVU</span>
          </div>
          <Link to="/login" className="btn btn-sm">Login</Link>
        </header>
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-white font-sans selection:bg-[#6C5DD3] selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full bg-[#111111] border-r border-white/5 flex flex-col p-6 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#6C5DD3] flex items-center justify-center shadow-lg shadow-[#6C5DD3]/20">
            <Shield className="text-white" size={24} />
          </div>
          <span className="font-bold text-2xl tracking-tight">KIVU</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {me?.role === "ADMIN" ? (
            <>
              <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/reports" icon={Users} label="Reports" />
              <SidebarItem to="/anomalies" icon={AlertTriangle} label="Anomalies" />
              <SidebarItem to="/holidays" icon={Calendar} label="Holidays" />
              <SidebarItem to="/company" icon={Settings} label="Settings" />
            </>
          ) : (
            <SidebarItem to="/admin" icon={LayoutDashboard} label="Overview" />
          )}
        </nav>

        {/* User Profile / Logout */}
        <div className="mt-auto pt-6 border-t border-white/5">
          {me && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400"></div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold truncate">{me.full_name || 'Admin'}</div>
                <div className="text-xs text-gray-500 truncate">{me.email}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5">
          <div>
            <h1 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Industrial Monitoring Portal</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#111]"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="text-sm font-medium text-gray-400">
              {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Scroll Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
