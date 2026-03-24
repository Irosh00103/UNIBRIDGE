import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('ub_user');
        const storedToken = localStorage.getItem('ub_token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('ub_user', JSON.stringify(userData));
        localStorage.setItem('ub_token', userToken);
        axios.defaults.headers.common.Authorization = `Bearer ${userToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ub_user');
        localStorage.removeItem('ub_token');
        delete axios.defaults.headers.common.Authorization;
        window.location.href = '/login';
    };

    const updateUser = (nextUser) => {
        setUser(nextUser);
        localStorage.setItem('ub_user', JSON.stringify(nextUser));
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
