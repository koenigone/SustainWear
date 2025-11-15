import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { // load user + organisation on refresh
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setOrganisation(null);
      setIsLoading(false);
      return;
    }

    api.get("/profile")
      .then((res) => {
        setUser(res.data.user);
        setOrganisation(res.data.user.organisation || null); 
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setOrganisation(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // login request 2fa
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("tempToken", res.data.tempToken);
    return res.data;
  };

  // verify 2fa code
  const verifyTwoFA = async (tempToken, code) => {
    const res = await api.post("/verifyTwoFactors", { tempToken, code });

    localStorage.setItem("token", res.data.token);
    localStorage.removeItem("tempToken");

    setUser(res.data.user);
    setOrganisation(res.data.user.organisation || null);
  };

  const logout = () => { // clear tokens and context on logout
    localStorage.removeItem("token");
    localStorage.removeItem("tempToken");
    setUser(null);
    setOrganisation(null);
  };

  return (
    <AuthContext.Provider 
      value={{ user, setUser, organisation, setOrganisation, isLoading, login, verifyTwoFA, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);