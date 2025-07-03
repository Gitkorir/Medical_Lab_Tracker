import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // To check initial auth status

    // Set up Axios default headers for JWT
    axios.defaults.baseURL = 'http://localhost:5000/api'; // Replace with your Flask backend URL

    // Function to set the auth token in localStorage and Axios headers
    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('access_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('access_token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Check for token on app load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // In a real app, you'd want to verify this token with your backend (e.g., a /verify endpoint)
            // For now, we'll assume it's valid if present
            setAuthToken(token);
            // You might want to decode the token here to get user info, or fetch from /api/users/me
            setIsAuthenticated(true);
            setUser({ /* User info from decoded token or /users/me */ }); // Placeholder
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/auth/login', { email, password }); // Destructure data directly
            const { access_token, user: userData } = data; // Use 'data' instead of 'response.data'
            setAuthToken(access_token);
            setUser(userData);
            setIsAuthenticated(true);
            return true; // Indicate success
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            // Handle specific errors (e.g., invalid credentials)
            return false; // Indicate failure
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await axios.post('/auth/register', { name, email, password, role });
            // Optionally auto-login after registration
            // const { access_token, user: userData } = response.data;
            // setAuthToken(access_token);
            // setUser(userData);
            // setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
            return false;
        }
    };

    const logout = () => {
        setAuthToken(null); // Remove token
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        setAuthToken // Expose for specific use cases if needed
    };

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner/splash screen
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};