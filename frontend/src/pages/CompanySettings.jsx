import { useEffect, useState } from "react"
import { api } from "../api.js"

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function CompanySettings() {
  const [s, setS] = useState(null)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    api.companySettings().then(setS).catch(() => setErr("Admin only."))
  }, [])

  const toggleDay = (d) => {
    const set = new Set(s.work_days)
    set.has(d) ? set.delete(d) : set.add(d)
    setS({ ...s, work_days: Array.from(set).sort((a, b) => a - b) })
  }

  const save = async () => {
    setErr(""); setMsg("")
    try {
      await api.updateCompanySettings({
        country_code: s.country_code,
        timezone: s.timezone,
        work_days: s.work_days,
        work_start: s.work_start,
        work_end: s.work_end,
        work_break_start: s.work_break_start,
        work_break_end: s.work_break_end
      })
      setMsg("Saved.")
    } catch (e) {
      setErr("Save failed.")
    }
  }

  if (!s) return <div className="py-8 text-white/70">{err || "Loading..."}</div>

  return (
    <div className="py-8 max-w-2xl">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Company Settings (Option A)</div>
        <div className="text-sm text-white/70 mt-1">
          Check-ins are blocked outside work window or on holidays.
        </div>

        <div className="text-sm text-white/80 mt-4">Company: <span className="text-white/90">{s.name}</span> — code <span className="text-white/90">{s.code}</span></div>

        <div className="grid gap-3 mt-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-white/70">Country (ISO2)</label>
              <input className="input" value={s.country_code} onChange={(e) => setS({ ...s, country_code: e.target.value.toUpperCase().slice(0, 2) })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-white/70">Timezone</label>
              <input className="input" value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })} />
            </div>
          </div>

          <label className="text-sm text-white/70">Work days</label>
          <div className="flex gap-2 flex-wrap">
            {dayNames.map((n, i) => (
              <button type="button" key={i} onClick={() => toggleDay(i)} className={"btn " + (s.work_days.includes(i) ? "btn-accent" : "")}>
                {n}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70">Work start</label>
              <input className="input" value={s.work_start} onChange={(e) => setS({ ...s, work_start: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/70">Work end</label>
              <input className="input" value={s.work_end} onChange={(e) => setS({ ...s, work_end: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm text-white/70">Break start (e.g. 13:00)</label>
              <input className="input" value={s.work_break_start || ""} onChange={(e) => setS({ ...s, work_break_start: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-white/70">Break end (e.g. 14:00)</label>
              <input className="input" value={s.work_break_end || ""} onChange={(e) => setS({ ...s, work_break_end: e.target.value })} />
            </div>
          </div>
          {err && <div className="text-sm text-red-300">{err}</div>}
          {msg && <div className="text-sm text-emerald-300">{msg}</div>}

          <button className="btn btn-accent" onClick={save}>Save settings</button>
        </div>
      </div>
    </div>
  )
}
