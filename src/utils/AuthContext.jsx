import { createContext, useEffect, useState, useContext } from "react";
import { account } from "../appwriteConfig";
import { useNavigate } from "react-router-dom";
import { ID } from "appwrite";

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        getUserOnLoad()
    }, [])

    const getUserOnLoad = async () => {
        try {
            const accountDetails = await account.get()
            console.log(accountDetails)
            setUser(accountDetails)
        } catch (error) {
            console.log(error);
        }
        setLoading(false)
    }

    const handleUserLogin = async (e, credentials) => {
        e.preventDefault()

        try {
            const response = await account.createEmailPasswordSession(credentials.email, credentials.password)
            console.log("Login response: ", response);

            const accountDetails = await account.get()
            setUser(accountDetails)
            // redirect to home page
            navigate('/')
        } catch (error) {
            console.log(error);
            
        }
    }

    const handleUserLogout = async () => {
        try {
            await account.deleteSession('current')
            setUser(null)
            navigate('/login')
        } catch (error) {
            console.log(error);
        }
    }

    const handleUserRegister = async (e, credentials) => {
        e.preventDefault();

        // Check if password and confirm password match
        if (credentials.password !== credentials.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            // Create a new user account
            const response = await account.create(
                ID.unique(),
                credentials.email,
                credentials.password,
                credentials.username
            )
            console.log("Register response: ", response);
            // Login the user directly after registration
            await account.createEmailPasswordSession(credentials.email, credentials.password);
            // Get account details and set user state
            const accountDetails = await account.get();
            setUser(accountDetails);

            // Redirect to home page
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const contextData = {
        user,
        handleUserLogin,
        handleUserLogout,
        handleUserRegister
    }

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <h1 className="loading">Loading...</h1> : children}
        </AuthContext.Provider>
    )
}

// useAuth hook
const useAuth = () => {
    return useContext(AuthContext)
}

export { AuthProvider, AuthContext, useAuth }