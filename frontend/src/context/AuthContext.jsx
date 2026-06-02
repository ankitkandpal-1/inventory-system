import React, { createContext, useState, useEffect, useContext } from "react";
import { backendClient } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("easymart_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await backendClient.getCurrentSession();
          setUser(userData);
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    try {
      const data = await backendClient.authenticateUser({ username_or_email: usernameOrEmail, password });
      localStorage.setItem("easymart_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await backendClient.signUpUser(userData);
      localStorage.setItem("easymart_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("easymart_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === "admin",
    isBuyer: user?.role === "buyer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
