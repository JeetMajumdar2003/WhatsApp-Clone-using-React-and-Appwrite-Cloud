import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

function Header() {
    const { user, handleUserLogout } = useAuth();

    return (
        <div id='header--wrapper'>
            {user ? (
                <div className='header--container'>
                    {/* Display the username if user is logged in */}
                    <h1>Welcome, {user.name}</h1>
                    <button className='btn btn--sm' onClick={handleUserLogout}>
                        <LogOut size={24} />
                        Logout
                    </button>
                </div>
            ) : (
                <div className='header--container'>
                    {/* Display a generic welcome message if no user is logged in */}
                    <h1>Welcome to the Private Chat App</h1>
                    <Link to='/login' className='btn btn--sm'>Login</Link>
                </div>
            )}
        </div>
    );
}

export default Header;