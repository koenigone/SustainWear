import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Button,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNotifications } from "../../../components/notificationsContext";
import { BellIcon } from "@chakra-ui/icons";
import api from "../../../api/axiosClient";

export default function Notifications({ isActive }) {
  const { refreshNotifications, setUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch notifications when component loads
  useEffect(() => {
    loadNotifications();
  }, []);

  // fetch notifications when tab becomes active
  useEffect(() => {
    if (isActive) loadNotifications();
  }, [isActive]);

  // load notifications from backend
  const loadNotifications = async () => {
    try {
      const res = await api.get("/donor/notifications");
      setNotifications(res.data);

      // count unread in this component
      const unread = res.data.filter((n) => !n.is_read).length;

      // update global context unread count
      setUnreadCount(unread);
      refreshNotifications();
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // mark a single notification as read
  const markAsRead = async (id) => {
    await api.put(`/donor/notifications/${id}/read`);

    const updated = notifications.map((n) =>
      n.notification_id === id ? { ...n, is_read: 1 } : n
    );

    setNotifications(updated);

    // update global unread count
    const unread = updated.filter((n) => !n.is_read).length;
    setUnreadCount(unread);

    refreshNotifications();
  };

  // mark all as read
  const markAllAsRead = async () => {
    await api.put(`/donor/notifications/read-all`);

    const updated = notifications.map((n) => ({ ...n, is_read: 1 }));
    setNotifications(updated);

    // zero out unread
    setUnreadCount(0);
    refreshNotifications();
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      boxShadow="md"
      maxW="700px"
      mx="auto"
      mt={6}
    >
      {/* HEADER BAR */}
      <HStack justify="space-between" mb={4}>
        <HStack>
          <Icon as={BellIcon} w={6} h={6} color="green.600" />
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            Notifications
          </Text>
        </HStack>

        {notifications.some((n) => !n.is_read) && (
          <Button
            size="sm"
            colorScheme="green"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </HStack>

      <Divider mb={4} />

      {/* LIST */}
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No notifications yet.
          </Text>
        ) : (
          notifications.map((n) => (
            <Box
              key={n.notification_id}
              p={4}
              rounded="md"
              borderWidth="1px"
              bg={n.is_read ? "gray.50" : "green.50"}
              borderColor={n.is_read ? "gray.300" : "green.300"}
              transition="0.2s"
            >
              <HStack justify="space-between">
                <Text
                  fontWeight="bold"
                  color={n.is_read ? "gray.700" : "green.700"}
                >
                  {n.title}
                </Text>

                {!n.is_read && (
                  <Badge colorScheme="green" fontSize="0.7em">
                    NEW
                  </Badge>
                )}
              </HStack>

              <Text mt={1} color="gray.700">
                {n.message}
              </Text>

              <Text mt={2} fontSize="sm" color="gray.500">
                {new Date(n.created_at).toLocaleString()}
              </Text>

              {!n.is_read && (
                <Button
                  size="xs"
                  mt={3}
                  colorScheme="green"
                  variant="outline"
                  onClick={() => markAsRead(n.notification_id)}
                >
                  Mark as Read
                </Button>
              )}
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}