import React, { useEffect, useState } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function LoginPage() {

    const { user, handleUserLogin } = useAuth()
    const navigate = useNavigate()

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    })

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    return (
        <div className='h-screen flex items-center justify-center bg-[#121212]'>
            <div className="w-full max-w-[400px] p-8 bg-[#1e1e1e] rounded-lg shadow-lg">
                <h1 className="text-center mb-4 text-2xl font-bold text-[#e0e0e0]">Login Page</h1>
                <form action="submit" onSubmit={(e) => { handleUserLogin(e, credentials) }}>
                    <div className="flex flex-col gap-2 py-2">
                        <label htmlFor="email" className="text-lg font-medium text-[#e0e0e0]">Email: </label>
                        <input
                            required
                            type="email"
                            name="email"
                            id="email"
                            placeholder='Enter your email'
                            value={credentials.email}
                            onChange={handleInputChange}
                            className="p-2 text-base border border-[#333333] rounded bg-[#262626] text-[#e0e0e0] focus:outline-none focus:border-[#009688]"
                        />
                    </div>
                    <div className="flex flex-col gap-2 py-2">
                        <label htmlFor="password" className="text-lg font-medium text-[#e0e0e0]">Password: </label>
                        <input
                            required
                            type="password"
                            name="password"
                            id="password"
                            placeholder='Enter your password'
                            value={credentials.password}
                            onChange={handleInputChange}
                            className="p-2 text-base border border-[#333333] rounded bg-[#262626] text-[#e0e0e0] focus:outline-none focus:border-[#009688]"
                        />
                    </div>

                    <div className="flex flex-col gap-2 py-2 mt-4">
                        <button className='px-4 py-2 text-base bg-[#009688] text-white rounded hover:bg-[#00796b] transition-colors cursor-pointer' type='submit'>Login</button>
                    </div>
                </form>
                <div className="flex flex-col gap-2 py-2 text-center">
                    <p className="text-[#b0b0b0]">Don't have an account? <Link to="/register" className="text-[#009688] hover:text-[#00796b] transition-colors">Go to Register Page</Link></p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage