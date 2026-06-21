import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingLayout } from '@/layouts/LandingLayout'
import { LandingPage } from '@/pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
