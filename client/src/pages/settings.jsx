import { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import api from "../api/axiosClient";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import PasswordResetModal from "../components/modals/resetPasswordModal";
import ConfirmAccountDeletion from "../components/modals/confirmAccountDeletionModal";

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const passwordModal = useDisclosure();

  const [nameData, setNameData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [deletePassword, setDeletePassword] = useState("");

  // change first/last name
  const handleNameChange = async () => {
    try {
      await api.put("/updateName", nameData);
      toast.success("Name updated successfully");
      setUser((prev) => ({
        ...prev,
        first_name: nameData.first_name,
        last_name: nameData.last_name,
      }));
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to update name");
    }
  };

  // delete account
  const handleDeleteAccount = async () => {
    try {
      await api.delete("/deleteAccount", { data: { password: deletePassword } });
      toast.success("Account deleted");
      deleteModal.onClose();
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to delete account");
    }
  };

  return (
    <Box
      bg="brand.beige"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      px={6}
    >
      <VStack
        spacing={8}
        textAlign="center"
        w={["100%", "400px"]}
        color="brand.green"
      >
        <Heading size="lg" mb={4}>
          Account Settings
        </Heading>

        <VStack w="100%" spacing={3}>
          <Heading size="sm">Change Name</Heading>
          <Input
            placeholder="First Name"
            _placeholder={{ color: "gray.400" }}
            value={nameData.first_name}
            onChange={(e) =>
              setNameData({ ...nameData, first_name: e.target.value })
            }
            bg="white"
            borderColor="brand.green"
            borderWidth="1.5px"
            _hover={{ borderColor: "brand.green" }}
            _focus={{
              borderColor: "brand.green",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
              bg: "white",
            }}
          />

          <Input
            placeholder="Last Name"
            _placeholder={{ color: "gray.400" }}
            value={nameData.last_name}
            onChange={(e) =>
              setNameData({ ...nameData, last_name: e.target.value })
            }
            bg="white"
            borderColor="brand.green"
            borderWidth="1.5px"
            _hover={{ borderColor: "brand.green" }}
            _focus={{
              borderColor: "brand.green",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
              bg: "white",
            }}
          />
          <Button
            bg="brand.green"
            color="white"
            _hover={{ bg: "green.700" }}
            w="100%"
            onClick={handleNameChange}
          >
            Save Changes
          </Button>
        </VStack>

        <Divider borderColor="brand.green" opacity={0.3} />

        <VStack w="100%" spacing={3}>
          <Heading size="sm">Change Password</Heading>
          <Text fontSize="sm" color="gray.600">
            A secure password reset link will be sent to your email.
          </Text>
          <Button
            bg="brand.green"
            color="white"
            _hover={{ bg: "green.700" }}
            w="100%"
            onClick={passwordModal.onOpen}
          >
            Change Password
          </Button>
        </VStack>

        <Divider borderColor="brand.green" opacity={0.3} />

        <VStack w="100%" spacing={3}>
          <Heading size="sm" color="red.500">
            Delete Account
          </Heading>
          <Text fontSize="sm" color="gray.600">
            This action is irreversible. All your data will be permanently
            removed.
          </Text>
          <Button
            bg="red.500"
            color="white"
            _hover={{ bg: "red.600" }}
            w="100%"
            onClick={deleteModal.onOpen}
          >
            Delete Account
          </Button>
        </VStack>
      </VStack>

      {/* CONFIRM PASSWORD CHANGE MODAL */}
      <PasswordResetModal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.onClose}
        isAuthenticated={true}
      />

      {/* ENTER PASSWORD TO CONFIRM DELETION MODAL */}
      <ConfirmAccountDeletion
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={handleDeleteAccount}
        password={deletePassword}
        setPassword={setDeletePassword}
      />
    </Box>
  );
}