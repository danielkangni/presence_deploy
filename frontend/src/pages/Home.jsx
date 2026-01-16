import { useEffect, useState } from "react"
import { api } from "../api.js"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [me, setMe] = useState(null)

  const nav = useNavigate()

  useEffect(() => {
    api.me().then(u => {
      setMe(u)
      if (u.role === "ADMIN" || u.role === "SUPER_ADMIN") {
        nav("/admin")
      }
    }).catch(() => { })
  }, [])

  return (
    <div className="py-20 flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
        Presence Administration
      </h1>
      <div className="mt-4 text-white/50 max-w-md">
        This web portal is restricted to Company Administrators.
      </div>

      {!me && (
        <div className="mt-8 flex gap-4">
          <button className="btn btn-accent px-8" onClick={() => nav("/login")}>Admin Login</button>
          <button className="btn px-8" onClick={() => nav("/create-company")}>Register Company</button>
        </div>
      )}

      {me && me.role !== "ADMIN" && me.role !== "SUPER_ADMIN" && (
        <div className="mt-8 p-4 glass rounded-xl text-yellow-200 bg-yellow-900/20 border border-yellow-500/20">
          You are logged in as an AGENT ({me.email}). <br />
          Please use the <strong>Mobile App</strong> to perform check-ins.
        </div>
      )}

    </div>
  )
}
