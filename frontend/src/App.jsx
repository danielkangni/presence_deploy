import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./Layout.jsx"
import Home from "./pages/Home.jsx"
import Signup from "./pages/Signup.jsx"
import Login from "./pages/Login.jsx"
import Admin from "./pages/Admin.jsx"
import CreateCompany from "./pages/CreateCompany.jsx"
import CompanySettings from "./pages/CompanySettings.jsx"
import Holidays from "./pages/Holidays.jsx"
// import Scan from "./pages/Scan.jsx"
// import Session from "./pages/Session.jsx"
import Anomalies from "./pages/Anomalies.jsx"
import Reports from "./pages/Reports.jsx"

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-company" element={<CreateCompany />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/company" element={<CompanySettings />} />
        <Route path="/holidays" element={<Holidays />} />
        {/* <Route path="/scan" element={<Scan />} /> */}
        {/* <Route path="/session/:id" element={<Session />} /> */}
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
