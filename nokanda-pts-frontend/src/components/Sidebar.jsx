import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ptsLogo from '../assets/pts-logo.png'

import {
  faGauge,
  faBook,
  faIdCard,
  faCar,
  faMoneyBill,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
    {label: 'Dashboard', path: '/dashboard', icon: faGauge},
    {label: 'Bookings', path: '/bookings', icon: faBook},
    {label: 'Drivers', path: '/drivers', icon: faIdCard},
    {label: 'Vehicles', path: '/vehicles', icon: faCar},
    {label: 'Pricing', path: '/pricing', icon: faMoneyBill},
    {label: 'Notifications', path: '/notifications', icon: faBell},

]

export default function Sidebar()  {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    return (
        <div
            className="fixed top-0 left-0 h-screen w-48 flex flex-col py-6 px-4 z-10"
            style={{backgroundColor: '#15435B'}}
        >
        
            {/**Logo */}
            <div className="mb-8 px-2">
                <img src={ptsLogo} alt="PTS" className="w-20 brightness-0 invert"></img>
            </div>

            {/**Nav Items */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                        ? 'bg-white text-[#15435B] font-semibold'
                        : 'text-white hover:bg-white/10'
                    }`
                    }
                >
                    <span><FontAwesomeIcon icon={item.icon} /></span>
                    {item.label}
                </NavLink>
                ))}
            </nav>

            {/**Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 rounded text-sm text-white hover:bg-white/10 transition-colors"
            >
                <span>⎋</span>
                Logout
            </button>

        </div>
    )
}