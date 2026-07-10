import {BrowserRouter, Routes, Route} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Drivers from './pages/Drivers'
import Vehicles from './pages/Vehicles'
import Pricing from './pages/Pricing'
import Notifications from './pages/Notifications'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Login/>}></Route>

          <Route element={
            <ProtectedRoute>
              <Layout/>
            </ProtectedRoute>}>

            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/bookings" element={<Bookings/>}></Route>
            <Route path="/drivers" element={<Drivers/>}></Route>
            <Route path="/vehicles" element={<Vehicles/>}></Route>
            <Route path="/pricing" element={<Pricing/>}></Route>
            <Route path="/notifications" element={<Notifications/>}></Route>

          </Route>

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App

