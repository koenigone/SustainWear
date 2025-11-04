import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";

/*
  this file manages global authentication state using react context
  It stores the logged in user, handles login/logout and automatically checks authentication on app load
  All components can access the user's info and auth functions through this context

  Structure:
  -Creates an AuthContext to share authentication data across the app
  -Uses useState to store the current user and loading state
  -useEffect checks for a saved token on app load and fetches the user profile
  -login(): handles user login and saves the token
  -logout(): clears user data and removes tokens
  -Provides all auth related data/functions via AuthContext.Provider
*/
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    api
      .get("/profile")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tempToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);