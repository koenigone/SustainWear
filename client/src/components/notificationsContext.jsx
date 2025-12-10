import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../auth/authContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      const res = await api.get("/donor/notifications");
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("Notification fetch failed");
    }
  };

  useEffect(() => {
    if (isLoading) return; // wait until authentication loads

    if (!user) {           // clear notifications for non logged users
      setUnreadCount(0);
      return;
    }

    // don't poll for non donors
    if (user.role !== "Donor") {
      setUnreadCount(0);
      return;
    }

    refreshNotifications(); // initial fetch

    // poll every 10 seconds
    const interval = setInterval(refreshNotifications, 10000);

    return () => clearInterval(interval);
  }, [user, isLoading]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, setUnreadCount, refreshNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);