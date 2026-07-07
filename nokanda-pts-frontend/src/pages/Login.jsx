import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ptsLogo from '../assets/pts-logo.png'
import axios from 'axios'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                formData
            )

            localStorage.setItem('token', response.data.access_token)
            navigate('/dashboard')
        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center" 
            style={{ backgroundColor: '#B4B8AB'}}
        >
            <div className='flex flex-col items-center w-fill max-w-sm px-8'>

            {/**Logo */}
            <img src={ptsLogo} alt='PTS Logo' className='w-40 mb-8'/>

                {/**Form */}
                <form onSubmit={handleLogin} className='w-full flex-col gap-3'>
                
                    {/**Email field */}
                    <div className='flex items-center gap-2 px-3 py-2 rounded border border-gray-300 bg-white mb-4'>
                        <input  
                            type='email'
                            placeholder='USERNAME'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='flex-1 outline-none text-sm tracking-widest placeholder-gray-400 bg-transparent'
                            style={{color: '#15435B'}}
                            required>
                        </input>
                    </div>

                    {/**Password field */}
                    <div className='flex items-center gap-2 px-3 py-2 rounded border border-gray-300 bg-white'>
                        <input  
                            type='password'
                            placeholder='PASSWORD'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='flex-1 outline-none text-sm tracking-widest placeholder-gray-400 bg-transparent'
                            style={{color: '#15435B'}}
                            required>
                        </input>
                    </div>

                    {/**Error message */}
                    {error && (
                        <p className='text-red-500 text-xs text-center'>{error}</p>
                    )}

                    {/**Login button */}
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full py-2 rounded text-sm font-semibold tracking-wideset mt-3 transition-opacity hover:opacity-90 disabled:opacity-60'
                        style={{backgroundColor: '#15435B', color: 'white'}}
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>

                    {/**Forgot password */}
                    <p
                        className='text-center text-xs mt-2 cursor-pointer hover:underline'
                        style={{color: '#15435B'}}
                    >
                        Forgot password?
                    </p>
                </form>
            </div>
        </div>
    )
}
