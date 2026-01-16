import { useEffect, useState } from "react"
import { api } from "../api.js"

export default function Anomalies(){
  const [items, setItems] = useState([])
  const [err, setErr] = useState("")

  useEffect(() => {
    api.anomalies().then(setItems).catch(()=>setErr("Login required."))
  }, [])

  return (
    <div className="py-8 grid gap-5">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Anomalies</div>
        <div className="text-sm text-white/70 mt-1">Auto-created when challenges fail/timeout (POC).</div>

        {err && <div className="text-sm text-red-300 mt-3">{err}</div>}

        <div className="grid gap-2 mt-4">
          {items.map(a => (
            <div key={a.id} className="glass rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{a.type}</div>
                <div className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">sev {a.severity}/5</div>
              </div>
              <div className="text-sm text-white/60 mt-1">{a.explanation}</div>
              <div className="text-xs text-white/40 mt-1">{new Date(a.detected_at).toLocaleString()}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-white/60">No anomalies yet.</div>}
        </div>
      </div>
    </div>
  )
}
