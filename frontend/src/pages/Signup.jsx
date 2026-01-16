import { useEffect, useState } from "react"
import { api } from "../api.js"
import { useNavigate } from "react-router-dom"

export default function Signup(){
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({ company_code:"DEMO-BJ", email:"", password:"", full_name:"" })
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const nav = useNavigate()

  useEffect(() => { api.companies().then(setCompanies).catch(()=>{}) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setMsg("")
    try{
      await api.signup(form)
      setMsg("Account created. Status: PENDING (wait for admin approval).")
      setTimeout(()=>nav("/login"), 800)
    }catch(e){
      setErr("Signup failed. Check company_code / email.")
    }
  }

  return (
    <div className="py-8 max-w-xl">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Agent Signup</div>
        <div className="text-sm text-white/70 mt-1">Create your account — admin must approve before you can login.</div>

        <form onSubmit={submit} className="grid gap-3 mt-4">
          <label className="text-sm text-white/70">Company</label>
          <select className="input" value={form.company_code} onChange={(e)=>setForm({...form, company_code:e.target.value})}>
            {companies.map(c => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)}
          </select>

          <label className="text-sm text-white/70">Full name</label>
          <input className="input" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} />

          <label className="text-sm text-white/70">Email</label>
          <input className="input" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />

          <label className="text-sm text-white/70">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />

          {err && <div className="text-sm text-red-300">{err}</div>}
          {msg && <div className="text-sm text-emerald-300">{msg}</div>}

          <button className="btn btn-accent mt-2">Create account</button>
        </form>
      </div>
    </div>
  )
}
