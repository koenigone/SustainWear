import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";

/*
  PasswordResetModal Component
  -Reusable for both authenticated and unauthenticated users
  -If 'email' prop is provided (login page), it sends to /forgotPassword
  -If user is authenticated (no email passed), it sends to /requestPasswordChange
  -Handles loading state and feedback via Chakra + toast
*/

export default function PasswordResetModal({
  isOpen,
  onClose,
  email: initialEmail = "",
  isAuthenticated = false, // explicitly define context
  title = "Reset Password",
}) {
  const [email, setEmail] = useState(initialEmail);
  const [isSendingLink, setIsSendingLink] = useState(false);

  // request password reset email link
  const handleRequestPasswordChange = async () => {
    setIsSendingLink(true);
    try {
      if (isAuthenticated) {
        await api.post("/requestPasswordChange");                          // user is logged in (settings page)
      } else {
        if (!email) return toast.error("Please enter your email address"); // user is not logged in (login/forgot password)
        await api.post("/forgotPassword", { email });
      }

      toast.success("Password reset link sent to your email");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to send reset link");
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        bg="brand.beige"
        border="1px solid"
        borderColor="brand.green"
        borderRadius="xl"
        color="brand.green"
        maxW="400px"
      >
        <ModalHeader
          textAlign="center"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor="brand.green"
        >
          {title}
        </ModalHeader>

        <ModalBody textAlign="center" py={6}>
          <VStack spacing={3}>
            {isAuthenticated ? (
              <>
                <Text>
                  A password reset link will be sent to your account email
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Click “Send Link” to proceed.
                </Text>
              </>
            ) : (
              <>
                <Text mb={2}>Enter your registered email address:</Text>
                <Input
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="white"
                  color="black"
                  borderColor="brand.green"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "brand.green" }}
                  _focus={{
                    borderColor: "brand.green",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
                    bg: "white",
                  }}
                />
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="brand.green"
          justifyContent="center"
        >
          <Button
            bg="brand.green"
            color="white"
            _hover={{ bg: "green.700" }}
            mr={3}
            onClick={handleRequestPasswordChange}
            isLoading={isSendingLink}
          >
            Send Link
          </Button>
          <Button variant="outline" color="brand.green" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}