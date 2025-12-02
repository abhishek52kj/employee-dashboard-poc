import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import Dashboard from "@/pages/Dashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<div>Employees Page (Coming Soon)</div>} />
          <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
