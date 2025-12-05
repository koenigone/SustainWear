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
import ConfirmAccountDeactivationModal from "../components/modals/confirmAccountDeactivationModal";

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const deactivateModal = useDisclosure();
  const passwordModal = useDisclosure();

  const [nameData, setNameData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [deactivatePassword, setDeactivatePassword] = useState("");

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

  // deactivate account
  const handleDeactivateAccount = async () => {
    try {
      await api.post("/deactivateAccount", {
        password: deactivatePassword
      });
      toast.success("Account deactivated successfully");
      deactivateModal.onClose();
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to deactivate account");
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
            Deactivate Account
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Your account will be deactivated.
            You can restore access to all your data by re-registering with the same email address.
          </Text>
          <Button
            bg="red.500"
            color="white"
            _hover={{ bg: "red.600" }}
            w="100%"
            onClick={deactivateModal.onOpen}
          >
            Deactivate Account
          </Button>
        </VStack>
      </VStack>

      {/* CONFIRM PASSWORD CHANGE MODAL */}
      <PasswordResetModal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.onClose}
        isAuthenticated={true}
      />

      {/* ENTER PASSWORD TO CONFIRM DEACTIVATE MODAL */}
      <ConfirmAccountDeactivationModal
        isOpen={deactivateModal.isOpen}
        onClose={deactivateModal.onClose}
        onConfirm={handleDeactivateAccount}
        password={deactivatePassword}
        setPassword={setDeactivatePassword}
      />
    </Box>
  );
}