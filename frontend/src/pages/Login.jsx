import { useState } from "react"
import { api, setToken } from "../api.js"
import { useNavigate } from "react-router-dom"

export default function Login(){
  const [email, setEmail] = useState("admin@test.com")
  const [password, setPassword] = useState("admin1234")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setLoading(true)
    try{
      const r = await api.login({ email, password })
      setToken(r.access_token)
      nav("/")
      window.location.reload()
    }catch(e){
      setErr("Login failed: bad credentials or not approved.")
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="py-8 max-w-xl">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Login</div>
        <div className="text-sm text-white/70 mt-1">Demo admin is pre-seeded.</div>

        <form onSubmit={submit} className="grid gap-3 mt-4">
          <label className="text-sm text-white/70">Email</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <label className="text-sm text-white/70">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {err && <div className="text-sm text-red-300">{err}</div>}
          <button className="btn btn-accent mt-2" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>

        <div className="text-xs text-white/50 mt-4">
          Demo admin: <span className="text-white/80">admin@test.com / admin1234</span> (company DEMO-BJ)
        </div>
      </div>
    </div>
  )
}
