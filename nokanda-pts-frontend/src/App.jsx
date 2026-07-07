import {BrowserRouter, Routes, Route} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Drivers from './pages/Drivers'
import Vehicles from './pages/Vehicles'
import Pricing from './pages/Pricing'
import Notifications from './pages/Notifications'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login/>}></Route>
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>}>
        </Route>
        
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings/>
          </ProtectedRoute>}>
        </Route>

        <Route path="/drivers" element={
          <ProtectedRoute>
            <Drivers/>
          </ProtectedRoute>}>
        </Route>

        <Route path="/vehicles" element={
          <ProtectedRoute>
            <Vehicles/>
          </ProtectedRoute>}>
        </Route>

        <Route path="/pricing" element={
          <ProtectedRoute>
            <Pricing/>
          </ProtectedRoute>}>
        </Route>

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications/>
          </ProtectedRoute>}>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App

