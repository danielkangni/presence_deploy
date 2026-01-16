// src/ui/index.jsx

export function Card({ children }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 shadow-xl p-6">
      {children}
    </div>
  );
}

export function CardBody({ children }) {
  return <div className="space-y-4">{children}</div>;
}

export function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-white/70">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-white/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Pill({ children, color = "green" }) {
  const colors = {
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}
