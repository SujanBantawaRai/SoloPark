import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('userInfo');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    // Registration: name, email, password, vehicleNumber, userType
    const register = async (name, email, password, vehicleNumber, userType) => {
        const { data } = await api.post('/auth/register', { name, email, password, vehicleNumber, userType });
        // Do NOT set user state immediately. Account requires OTP verification first.
        return data;
    };

    const verifyOtp = async (email, otp) => {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        return data;
    };

    const resendOtp = async (email) => {
        const { data } = await api.post('/auth/resend-otp', { email });
        return data;
    };

    const updateUserState = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, resendOtp, logout, loading, updateUserState }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
