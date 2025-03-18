import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        if (token) {
            setUser({ username: localStorage.getItem("username") });
        }
    }, [token]);

    const login = (token, username) => {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        setUser({ username });
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
