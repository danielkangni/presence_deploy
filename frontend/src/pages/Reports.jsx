import { useState } from "react"
import { api } from "../api.js"

export default function Reports(){
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0,10)
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [to, setTo] = useState(iso(today))
  const [data, setData] = useState(null)
  const [err, setErr] = useState("")

  const run = async () => {
    setErr(""); setData(null)
    try{
      const r = await api.reportAgents(from, to)
      setData(r)
    }catch(e){
      setErr("Admin only. Login as admin@test.com.")
    }
  }

  return (
    <div className="py-8 grid gap-5">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Reports (POC)</div>
        <div className="text-sm text-white/70 mt-1">Filter by date range and see anomalies/check-ins per agent.</div>

        <div className="grid md:grid-cols-3 gap-3 mt-4 items-end">
          <div>
            <div className="text-sm text-white/70">From</div>
            <input className="input" type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-white/70">To</div>
            <input className="input" type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
          <button className="btn btn-accent" onClick={run}>Run report</button>
        </div>

        {err && <div className="text-sm text-red-300 mt-3">{err}</div>}

        {data && (
          <div className="mt-5 grid gap-2">
            {data.rows.map((r, idx) => (
              <div key={idx} className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-3">
                <div className="font-medium">{r.user_email}</div>
                <div className="text-sm text-white/70">checkins: <span className="text-white/90">{r.checkins}</span> • anomalies: <span className="text-white/90">{r.anomalies}</span> • open: <span className="text-white/90">{r.open_anomalies}</span></div>
              </div>
            ))}
            {data.rows.length === 0 && <div className="text-sm text-white/60">No agents in this company.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
