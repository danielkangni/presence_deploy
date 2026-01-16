import { useEffect, useState } from "react"
import { api } from "../api.js"
import { useParams } from "react-router-dom"

export default function Session(){
  const { id } = useParams()
  const [sess, setSess] = useState(null)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")
  const [challengeId, setChallengeId] = useState(null)

  const load = () => api.session(id).then(setSess).catch(()=>setErr("Session not found or login required."))
  useEffect(()=>{ load() }, [id])

  const simulateIssue = async () => {
    setErr(""); setMsg("")
    try{
      const me = await api.me()
      const ch = await api.issueChallenge({ session_id: Number(id), user_email: me.email, ttl_seconds: 20 })
      setChallengeId(ch.id)
      setMsg(`Challenge issued (#${ch.id}). Resolve within 20s.`)
    }catch(e){
      setErr("Challenge issue is ADMIN-only. Login as admin to issue challenges (Swagger or Admin tool).")
    }
  }

  const resolve = async (passed) => {
    setErr(""); setMsg("")
    if (!challengeId) return setErr("No challenge to resolve.")
    try{
      const r = await api.resolveChallenge({ challenge_id: challengeId, passed })
      setMsg(`Challenge status: ${r.status}`)
    }catch(e){
      setErr("Resolve failed (login required).")
    }
  }

  if (!sess) return <div className="py-8 text-white/70">{err || "Loading..."}</div>

  return (
    <div className="py-8 max-w-2xl grid gap-5">
      <div className="glass rounded-2xl p-5">
        <div className="text-lg font-semibold">Presence Session #{sess.id}</div>
        <div className="text-sm text-white/70 mt-2 grid gap-1">
          <div>Status: <span className="text-white/90">{sess.status}</span></div>
          <div>Started: {new Date(sess.started_at).toLocaleString()}</div>
          <div>Expected end: {new Date(sess.expected_end_at).toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-2">
            POC note: real version triggers random biometric challenges + checks geofence automatically.
          </div>
        </div>

        {err && <div className="text-sm text-red-300 mt-3">{err}</div>}
        {msg && <div className="text-sm text-emerald-300 mt-3">{msg}</div>}

        <div className="flex gap-2 flex-wrap mt-4">
          <button className="btn btn-accent" onClick={simulateIssue}>Issue challenge (admin-only)</button>
          <button className="btn" onClick={()=>resolve(true)}>Resolve: PASS</button>
          <button className="btn" onClick={()=>resolve(false)}>Resolve: FAIL</button>
        </div>
      </div>
    </div>
  )
}
