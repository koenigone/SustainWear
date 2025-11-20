import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../auth/authContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    if (!user) return; // no user, no notifications

    try {
      const res = await api.get("/donor/notifications");
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("Notification fetch failed:", err?.response?.status);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (isLoading) return; // wait until auth finishes loading
    if (!user) {           // if no authenticated user, stop everything
      setUnreadCount(0);
      return;
    }

    refreshNotifications(); // initial fetch

    const interval = setInterval(() => { // start polling only when authenticated
      refreshNotifications();
    }, 3000);

    return () => clearInterval(interval);

  }, [user, isLoading]);  // re-run when auth state changes

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);