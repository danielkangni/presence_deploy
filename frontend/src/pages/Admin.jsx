import { useEffect, useState } from "react"
import { api } from "../api.js"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet';
import { Play, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, radius }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <>
      <Marker position={position} draggable={true} eventHandlers={{
        dragend: (e) => setPosition(e.target.getLatLng())
      }}>
        <Popup>Site Center</Popup>
      </Marker>
      <Circle center={position} pathOptions={{ fillColor: '#6C5DD3' }} radius={radius} />
    </>
  )
}

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-[#1F1F25] rounded-3xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
    <div className="z-10">
      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      {sub && <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-${color}-500/10 text-${color}-400 text-xs font-bold`}>
        {sub}
      </div>}
    </div>
    {Icon && <Icon className={`absolute bottom-4 right-4 text-${color}-500/20 w-24 h-24 group-hover:scale-110 transition-transform`} />}
  </div>
)

export default function Admin() {
  const [tab, setTab] = useState("Dashboard")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  const [pending, setPending] = useState([])

  // Manual Forms State
  const [newUser, setNewUser] = useState({ email: "", full_name: "", password: "", role: "AGENT" })
  const [newSite, setNewSite] = useState({ name: "", city: "", code: "", lat: "", lng: "", radius: 200 })
  const [checkin, setCheckin] = useState({ site_id: "", agent_a_id: "", agent_b_id: "", note: "" })
  const [mapCenter, setMapCenter] = useState({ lat: 6.3654, lng: 2.4183 }); // Cotonou default

  // Lists for dropdowns
  const [sites, setSites] = useState([])

  const loadPending = () => api.pending().then(setPending).catch(() => setErr("Error loading pending users"))
  const loadSites = () => api.sites().then(setSites).catch(() => { })

  useEffect(() => {
    loadPending()
    loadSites()
  }, [])

  const decide = async (user_id, decision) => {
    setErr(""); setMsg("")
    try { await api.approve({ user_id, decision }); setMsg("Done"); loadPending(); }
    catch (e) { setErr("Failed"); }
  }

  const doCreateUser = async () => {
    setErr(""); setMsg("")
    try { await api.createUserManual(newUser); setMsg("User created"); setNewUser({ email: "", full_name: "", password: "", role: "AGENT" }); }
    catch (e) { setErr(e.message); }
  }

  const doCreateSite = async () => {
    setErr(""); setMsg("")
    try {
      const payload = {
        ...newSite,
        code: newSite.code || "SITE-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        lat: newSite.lat ? String(newSite.lat) : null,
        lng: newSite.lng ? String(newSite.lng) : null
      };
      await api.createSiteManual(payload);
      setMsg("Site created"); loadSites();
      setNewSite({ name: "", city: "", code: "", lat: "", lng: "", radius: 200 });
    }
    catch (e) { setErr(e.message); }
  }

  const doCheckin = async () => {
    setErr(""); setMsg("")
    try {
      await api.createCheckinManual({
        site_id: parseInt(checkin.site_id),
        agent_a_id: parseInt(checkin.agent_a_id),
        agent_b_id: parseInt(checkin.agent_b_id),
        note: checkin.note
      });
      setMsg("Checkin created");
      setCheckin({ site_id: "", agent_a_id: "", agent_b_id: "", note: "" })
    }
    catch (e) { setErr(e.message); }
  }

  const handleMapClick = (latlng) => {
    setNewSite({ ...newSite, lat: latlng.lat, lng: latlng.lng });
  }

  // Tabs Configuration
  const tabs = ["Dashboard", "Pending", "Add User", "Add Site"];

  return (
    <div className="max-w-7xl mx-auto">

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === t
                ? "bg-[#6C5DD3] text-white shadow-lg shadow-[#6C5DD3]/30"
                : "bg-[#1F1F25] text-gray-400 hover:text-white hover:bg-[#2C2C35]"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Messages */}
      {err && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20} /> {err}</div>}
      {msg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20} /> {msg}</div>}

      {/* VIEW: DASHBOARD */}
      {tab === "Dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Col: Manual Checkin */}
          <div className="lg:col-span-1 bg-[#1F1F25] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Manual Check-in</h2>
                <p className="text-gray-500 text-xs mt-1">Create a binome session manually.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Site ID</label>
                <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C5DD3]"
                  placeholder="Enter Site ID"
                  value={checkin.site_id}
                  onChange={e => setCheckin({ ...checkin, site_id: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Agent A ID</label>
                  <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C5DD3]"
                    placeholder="ID"
                    value={checkin.agent_a_id}
                    onChange={e => setCheckin({ ...checkin, agent_a_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Agent B ID</label>
                  <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C5DD3]"
                    placeholder="ID"
                    value={checkin.agent_b_id}
                    onChange={e => setCheckin({ ...checkin, agent_b_id: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Note</label>
                <textarea className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C5DD3] h-24 resize-none"
                  placeholder="Optional notes..."
                  value={checkin.note}
                  onChange={e => setCheckin({ ...checkin, note: e.target.value })}
                />
              </div>

              <button onClick={doCheckin} className="w-full bg-gradient-to-r from-[#6C5DD3] to-[#4F46E5] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-4">
                <Play size={20} fill="currentColor" />
                Start Session
              </button>

            </div>
          </div>

          {/* Right Col: Stats & Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-6">
              <StatCard title="Total Sites" value={sites.length} sub="+2 This Week" icon={TrendingUp} color="emerald" />
              <StatCard title="Active Binomes" value="48" sub="92% Compliance" icon={CheckCircle} color="blue" />
            </div>

            {/* Anomalies Panel */}
            <div className="bg-[#1F1F25] rounded-3xl p-6 h-[260px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="text-red-500" />
                  Recent Anomalies
                </h3>
                <button className="text-[#6C5DD3] text-xs font-bold hover:underline">View All</button>
              </div>

              {/* Empty State / Placeholder */}
              <div className="flex-1 rounded-xl bg-[#111111] border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1F1F25] flex items-center justify-center mb-3">
                  <CheckCircle className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No anomalies detected yet today.</p>
                <p className="text-gray-600 text-xs">Systems are operating within normal parameters.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: PENDING */}
      {tab === "Pending" && (
        <div className="grid gap-3">
          {pending.length === 0 && <div className="text-gray-500">No pending users.</div>}
          {pending.map(u => (
            <div key={u.id} className="bg-[#1F1F25] p-4 flex justify-between items-center rounded-2xl border border-white/5">
              <div>
                <div className="font-bold text-white">{u.email}</div>
                <div className="text-gray-500 text-xs">ID #{u.id}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30" onClick={() => decide(u.id, "APPROVE")}>Approve</button>
                <button className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/30" onClick={() => decide(u.id, "REJECT")}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: ADD USER */}
      {tab === "Add User" && (
        <div className="bg-[#1F1F25] rounded-3xl p-8 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-6 text-white">Associate New User</h2>
          <div className="space-y-4">
            <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Full Name" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
            <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="AGENT">AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button className="w-full bg-[#6C5DD3] text-white font-bold py-4 rounded-xl mt-4 hover:bg-[#5b4eb8] transition-colors" onClick={doCreateUser}>Create User Account</button>
          </div>
        </div>
      )}

      {/* VIEW: ADD SITE */}
      {tab === "Add Site" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1F1F25] rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 text-white">Create New Site</h2>
            <div className="space-y-4">
              <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Name (e.g. Depot)" value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })} />
              <input className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="City" value={newSite.city} onChange={e => setNewSite({ ...newSite, city: e.target.value })} />
              <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-white/5">
                <label className="text-sm text-gray-400 whitespace-nowrap">Radius (meters):</label>
                <input className="w-full bg-transparent text-white font-bold focus:outline-none text-right" type="number" value={newSite.radius} onChange={e => setNewSite({ ...newSite, radius: parseInt(e.target.value) })} />
              </div>
              <div className="text-xs text-gray-500 bg-[#111111] p-3 rounded-xl border border-white/5 font-mono">
                LAT: {newSite.lat || 'Select on Map'}<br />
                LNG: {newSite.lng || 'Select on Map'}
              </div>
              <button className="w-full bg-[#6C5DD3] text-white font-bold py-4 rounded-xl mt-4 hover:bg-[#5b4eb8] transition-colors" onClick={doCreateSite}>Create Site</button>
            </div>
          </div>

          <div className="bg-[#1F1F25] rounded-3xl p-1 overflow-hidden h-[500px] border border-white/5">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", borderRadius: "20px" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                position={newSite.lat ? { lat: newSite.lat, lng: newSite.lng } : null}
                setPosition={handleMapClick}
                radius={newSite.radius}
              />
            </MapContainer>
          </div>

          {/* List of existing Sites */}
          <div className="lg:col-span-2 bg-[#1F1F25] rounded-3xl p-8">
            <h3 className="font-bold text-white mb-4">Existing Sites</h3>
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sites.map(s => (
                <div key={s.id} className="bg-[#111111] p-4 rounded-xl border border-white/5">
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-gray-500 text-sm">{s.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
