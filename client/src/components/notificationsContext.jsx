import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // fetch unread count from backend
  const refreshNotifications = async () => {
    try {
      const res = await api.get("/donor/notifications");
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  // run once when layout loads
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 3000); // refresh every 3 seconds

    return () => clearInterval(interval);
  }, []);

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