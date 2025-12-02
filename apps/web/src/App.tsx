import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import Dashboard from "@/pages/Dashboard"
import Employees from "@/pages/Employees"
import Login from "@/pages/Login"
import Analytics from "@/pages/Analytics"
import Settings from "@/pages/Settings"
import ActivityLogs from "@/pages/ActivityLogs"
import Leaves from "@/pages/Leaves"

const ProtectedRoute = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="leaves" element={<Leaves />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
