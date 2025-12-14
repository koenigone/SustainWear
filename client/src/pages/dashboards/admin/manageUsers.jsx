import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Stack,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  HStack,
  Spinner,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import ConfirmToggleUserModal from "../../../components/modals/admin/confirmToggleUserModal";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmModal = useDisclosure();

  // fetch users
  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  // search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.first_name.toLowerCase().includes(term) ||
          u.last_name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  // open modal
  const openModal = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    confirmModal.onOpen();
  };

  // confirm action
  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      const newRole = actionType === "promote" ? "Admin" : selectedUser.role;
      const newStatus = actionType === "deactivate" ? false : true;

      await api.put("/admin/users", {
        user_id: selectedUser.user_id,
        role: newRole,
        is_active: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === selectedUser.user_id
            ? { ...u, role: newRole, is_active: newStatus }
            : u
        )
      );

      setFilteredUsers((prev) =>
        prev.map((u) =>
          u.user_id === selectedUser.user_id
            ? { ...u, role: newRole, is_active: newStatus }
            : u
        )
      );

      toast.success("User updated successfully");
      confirmModal.onClose();
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to update user");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={{ base: 4, md: 6 }} bg="white" rounded="lg" boxShadow="md">
      <Input
        placeholder="Search by name or email..."
        mb={4}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        maxW="400px"
      />

      {filteredUsers.length === 0 ? (
        <Text color="gray.500">No users found</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 1 }} spacing={4}>
          {filteredUsers.map((user) => (
            <Box
              key={user.user_id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              _hover={{ boxShadow: "md" }}
            >
              <Stack spacing={3}>
                {/* Header */}
                <HStack justify="space-between">
                  <Heading size="sm">
                    {user.first_name} {user.last_name}
                  </Heading>

                  <Badge colorScheme={user.is_active ? "green" : "red"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </HStack>

                {/* Meta */}
                <Text fontSize="sm" color="gray.600">
                  {user.email}
                </Text>

                <Divider />

                <HStack>
                  <Text fontSize="sm">
                    <strong>Role:</strong>
                  </Text>
                  <Badge colorScheme={user.role === "Admin" ? "blue" : "gray"}>
                    {user.role}
                  </Badge>
                </HStack>

                {/* Actions */}
                <HStack pt={2} spacing={3} flexWrap="wrap">
                  {user.role !== "Admin" ? (
                    <>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => openModal(user, "promote")}
                      >
                        Promote to Admin
                      </Button>

                      <Button
                        size="sm"
                        colorScheme={user.is_active ? "yellow" : "green"}
                        onClick={() =>
                          openModal(
                            user,
                            user.is_active ? "deactivate" : "activate"
                          )
                        }
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </>
                  ) : (
                    <Badge>Already Admin</Badge>
                  )}
                </HStack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmToggleUserModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.onClose}
        onConfirm={handleConfirmAction}
        selectedUser={selectedUser}
        actionType={actionType}
        isLoading={isProcessing}
      />
    </Box>
  );
}