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
        <div className='auth--container'>
            <div className="form--wrapper">
                <h1>Login Page</h1>
                <form action="submit" onSubmit={(e) => { handleUserLogin(e, credentials) }}>
                    <div className="field--wrapper">
                        <label htmlFor="email">Email: </label>
                        <input
                            required
                            type="email"
                            name="email"
                            id="email"
                            placeholder='Enter your email'
                            value={credentials.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field--wrapper">
                        <label htmlFor="password">Password: </label>
                        <input
                            required
                            type="password"
                            name="password"
                            id="password"
                            placeholder='Enter your password'
                            value={credentials.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field--wrapper">
                        <button className='btn btn--lg' type='submit'>Login</button>
                    </div>
                </form>
                <div className="field--wrapper">
                    <p>Don't have an account? <Link to="/register">Go to Register Page</Link></p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage