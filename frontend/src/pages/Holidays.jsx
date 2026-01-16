import { useEffect, useState } from "react"
import { api } from "../api.js"

export default function Holidays(){
  const y = new Date().getFullYear()
  const [year, setYear] = useState(y)
  const [items, setItems] = useState([])
  const [date, setDate] = useState("")
  const [name, setName] = useState("")
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")

  const load = () => api.listHolidays(year).then(setItems).catch(()=>setErr("Admin only."))

  useEffect(() => { load() }, [year])

  const sync = async () => {
    setErr(""); setMsg("")
    try{
      const r = await api.syncHolidays(year)
      setMsg(`Synced ${r.added} holidays for ${r.country_code} (${year}).`)
      load()
    }catch(e){
      setErr("Sync failed (country not supported or admin only).")
    }
  }

  const add = async () => {
    setErr(""); setMsg("")
    try{
      await api.addHoliday(date, name)
      setMsg("Added custom holiday.")
      setDate(""); setName("")
      load()
    }catch(e){
      setErr("Add failed.")
    }
  }

  const del = async (d) => {
    setErr(""); setMsg("")
    try{
      await api.deleteHoliday(d)
      setMsg("Deleted.")
      load()
    }catch(e){
      setErr("Delete failed.")
    }
  }

  return (
    <div className="py-8">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Holidays (Option A)</div>
        <div className="text-sm text-white/70 mt-1">
          Sync official holidays by country/year, then add custom ones. Check-ins are blocked on these dates.
        </div>

        <div className="flex gap-3 mt-4 flex-wrap items-end">
          <div>
            <div className="text-sm text-white/70">Year</div>
            <input className="input" type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))} />
          </div>
          <button className="btn btn-accent" onClick={sync}>Sync holidays</button>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-sm text-white/70">Custom date</div>
            <input className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-white/70">Name</div>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Company holiday" />
          </div>
          <button className="btn" onClick={add}>Add custom</button>
        </div>

        {err && <div className="text-sm text-red-300 mt-3">{err}</div>}
        {msg && <div className="text-sm text-emerald-300 mt-3">{msg}</div>}

        <div className="grid gap-2 mt-5">
          {items.map((h, idx) => (
            <div key={idx} className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{h.date} <span className="text-xs text-white/50">({h.source})</span></div>
                <div className="text-sm text-white/60">{h.name}</div>
              </div>
              <button className="btn" onClick={()=>del(h.date)}>Delete</button>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-white/60">No holidays loaded for this year.</div>}
        </div>
      </div>
    </div>
  )
}
