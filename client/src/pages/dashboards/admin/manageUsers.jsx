import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Flex,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Spinner,
  Heading,
  HStack,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import ConfirmToggleUserModal from "../../../components/modals/confirmToggleUserModal.jsx";

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

  // update user data
  const handleUpdate = async (user_id, role, is_active) => {
    try {
      await api.put("/admin/users", { user_id, role, is_active });
      toast.success("User updated successfully");
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user_id ? { ...u, role, is_active } : u
        )
      );
    } catch (err) {
      const msg = err.response?.data?.errMessage;
      toast.error(msg);
    }
  };

  // open modal for confirmation
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

      toast.success(
        actionType === "promote"
          ? "User promoted to Admin successfully"
          : newStatus
            ? "User activated successfully"
            : "User deactivated successfully"
      );

      confirmModal.onClose();
    } catch (err) {
      const msg = err.response?.data?.errMessage || "Failed to update user";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <Input
        placeholder="Search by name or email..."
        _placeholder={{ color: "gray.400" }}
        mb={4}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        bg="gray.50"
        borderColor="gray.300"
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Full Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody color="grey">
          {filteredUsers.length === 0 ? (
            <Tr>
              <Td colSpan={6} textAlign="center" color="gray.500">
                No users found
              </Td>
            </Tr>
          ) : (
            filteredUsers.map((user) => (
              <Tr key={user.user_id}>
                <Td>{user.first_name} {user.last_name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Flex justify="center" align="center" width="100%">
                    <Badge
                      colorScheme={user.role === "Admin" ? "blue" : "gray"}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {user.role}
                    </Badge>
                  </Flex>
                </Td>
                <Td>
                  <Flex justify="center" align="center" width="100%">
                    <Badge
                      colorScheme={user.is_active ? "green" : "red"}
                      px={3}
                      py={1}
                      borderRadius="md"
                      textAlign="center"
                      minW="80px"
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Flex>
                </Td>
                <Td width="250px">
                  {user.role !== "Admin" ? (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        width="60%"
                        colorScheme="blue"
                        onClick={() => openModal(user, "promote")}
                      >
                        Promote to Admin
                      </Button>

                      <Button
                        size="sm"
                        width="40%"
                        colorScheme={user.is_active ? "yellow" : "green"}
                        onClick={() =>
                          user.is_active
                            ? openModal(user, "deactivate")
                            : handleUpdate(user.user_id, user.role, true)
                        }
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </HStack>
                  ) : (
                    <Flex justify="center" width="240px">
                      <Badge
                        colorScheme="gray"
                        w="100%"
                        textAlign="center"
                        py={1}
                        borderRadius="md"
                      >
                        Already Admin
                      </Badge>
                    </Flex>
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* CONFIRM TOGGLE USER MODAL */}
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