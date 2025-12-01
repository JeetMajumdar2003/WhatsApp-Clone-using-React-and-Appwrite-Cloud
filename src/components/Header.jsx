import { LogOut } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

function Header() {
    const { user, handleUserLogout } = useAuth();

    return (
        <div className='bg-[#009688] p-4 shadow-md flex justify-between items-center'>
            {user ? (
                <div className='flex justify-between items-center w-full max-w-6xl mx-auto'>
                    {/* Display the username if user is logged in */}
                    <h1 className="text-xl text-white font-bold m-2">Welcome, {user.name}</h1>
                    <button className='bg-[#00796b] text-white px-4 py-2 rounded hover:bg-[#009688] shadow-md transition-colors flex items-center gap-2' onClick={handleUserLogout}>
                        <LogOut size={24} />
                        Logout
                    </button>
                </div>
            ) : (
                <div className='flex justify-between items-center w-full max-w-6xl mx-auto'>
                    {/* Display a generic welcome message if no user is logged in */}
                    <h1 className="text-xl text-white font-bold m-2">Welcome to the Private Chat App</h1>
                    <Link to='/login' className='bg-[#00796b] text-white px-4 py-2 rounded hover:bg-[#009688] shadow-md transition-colors flex items-center gap-2'>Login</Link>
                </div>
            )}
        </div>
    );
}

export default Header;