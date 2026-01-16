import { useState } from "react"
import { api, setToken } from "../api.js"
import { useNavigate } from "react-router-dom"

const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

export default function CreateCompany(){
  const [form, setForm] = useState({
    company_name: "My Security Co",
    country_code: "BJ",
    timezone: "Africa/Porto-Novo",
    work_days: [0,1,2,3,4],
    work_start: "08:00",
    work_end: "18:00",
    admin_email: "",
    admin_password: "",
    admin_full_name: ""
  })
  const [err, setErr] = useState("")
  const [ok, setOk] = useState("")
  const nav = useNavigate()

  const toggleDay = (d) => {
    const s = new Set(form.work_days)
    s.has(d) ? s.delete(d) : s.add(d)
    setForm({...form, work_days: Array.from(s).sort((a,b)=>a-b)})
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setOk("")
    try{
      const r = await api.registerCompany(form)
      setOk(`Company created. company_code: ${r.company_code}`)
      const t = await api.login({ email: form.admin_email, password: form.admin_password })
      setToken(t.access_token)
      nav("/")
      window.location.reload()
    }catch(e){
      setErr("Create company failed. Check admin email and try again.")
    }
  }

  return (
    <div className="py-8 max-w-2xl">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Create Company (POC)</div>
        <div className="text-sm text-white/70 mt-1">
          Creates a company + the first admin (ACTIVE). Agents later sign up with company_code and wait for approval.
        </div>

        <form onSubmit={submit} className="grid gap-3 mt-4">
          <label className="text-sm text-white/70">Company name</label>
          <input className="input" value={form.company_name} onChange={(e)=>setForm({...form, company_name:e.target.value})} />

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-white/70">Country (ISO2)</label>
              <input className="input" value={form.country_code} onChange={(e)=>setForm({...form, country_code:e.target.value.toUpperCase().slice(0,2)})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-white/70">Timezone</label>
              <input className="input" value={form.timezone} onChange={(e)=>setForm({...form, timezone:e.target.value})} />
            </div>
          </div>

          <label className="text-sm text-white/70">Work days</label>
          <div className="flex gap-2 flex-wrap">
            {dayNames.map((n, i) => (
              <button type="button" key={i} onClick={()=>toggleDay(i)} className={"btn " + (form.work_days.includes(i) ? "btn-accent" : "")}>
                {n}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70">Work start</label>
              <input className="input" value={form.work_start} onChange={(e)=>setForm({...form, work_start:e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-white/70">Work end</label>
              <input className="input" value={form.work_end} onChange={(e)=>setForm({...form, work_end:e.target.value})} />
            </div>
          </div>

          <div className="mt-2 text-sm text-white/70">First admin credentials</div>
          <label className="text-sm text-white/70">Admin full name</label>
          <input className="input" value={form.admin_full_name} onChange={(e)=>setForm({...form, admin_full_name:e.target.value})} />

          <label className="text-sm text-white/70">Admin email</label>
          <input className="input" value={form.admin_email} onChange={(e)=>setForm({...form, admin_email:e.target.value})} placeholder="admin@company.com" />

          <label className="text-sm text-white/70">Admin password</label>
          <input className="input" type="password" value={form.admin_password} onChange={(e)=>setForm({...form, admin_password:e.target.value})} />

          {err && <div className="text-sm text-red-300">{err}</div>}
          {ok && <div className="text-sm text-emerald-300">{ok}</div>}

          <button className="btn btn-accent mt-2">Create company</button>
        </form>
      </div>
    </div>
  )
}
