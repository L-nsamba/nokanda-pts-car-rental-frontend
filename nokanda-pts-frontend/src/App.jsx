import {BrowserRouer, Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Drivers from './pages/Drivers'
import Vehicles from './pages/Vehicles'
import Pricing from './pages/Pricing'
import Notifications from './pages/Notifications'

function App() {
  return (
    <BrowserRouer>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/bookings" element={<Bookings/>}></Route>
        <Route path="/drivers" element={<Drivers/>}></Route>
        <Route path="/vehicles" element={<Vehicles/>}></Route>
        <Route path="/pricing" element={<Pricing/>}></Route>
        <Route path="/notifications" element={<Notifications/>}></Route>
      </Routes>
    </BrowserRouer>
  )
}

export default App

