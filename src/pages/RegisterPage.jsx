import React, { useState } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function RegisterPage() {
    const { handleUserRegister } = useAuth()
    const navigate = useNavigate()

    // State to hold form credentials
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    // Handle input change for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    return (
        <div className='auth--container'>
            <div className="form--wrapper">
                <h1>Register Page</h1>
                <form action="submit" onSubmit={(e) => {handleUserRegister(e, credentials)}}>
                    {/* Username field */}
                    <div className="field--wrapper">
                        <label htmlFor="username">Username: </label>
                        <input
                            required
                            type="text"
                            name="username"
                            id="username"
                            placeholder='Enter your username'
                            value={credentials.username}
                            onChange={handleInputChange}
                        />
                    </div>
                    {/* Email field */}
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
                    {/* Password field */}
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
                    {/* Confirm Password field */}
                    <div className="field--wrapper">
                        <label htmlFor="confirmPassword">Confirm Password: </label>
                        <input
                            required
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder='Confirm your password'
                            value={credentials.confirmPassword}
                            onChange={handleInputChange}
                        />
                    </div>
                    {/* Submit button */}
                    <div className="field--wrapper">
                        <button className='btn btn--lg' type='submit'>Register</button>
                    </div>
                </form>
                {/* Link to login page */}
                <div className="field--wrapper">
                    <p>Already have an account? <Link to="/login">Go to Login Page</Link></p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage