import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { cloneElement } from "react";

// A wrapper that adds a confirmation modal to any button or clickable element
export default function ConfirmLogout({
  children,
  title = "Confirm Logout",
  message = "Are you sure you want to log out of your account?",
  confirmText = "Logout",
  closeText = "Cancel",
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Clone original click handler
  const origHandler = children.props.onClick;

  // Replace the child's onClick to open the modal instead
  const clone = cloneElement(children, { onClick: onOpen });

  // Handle confirm action
  const handleConfirm = () => {
    onClose();
    if (origHandler) origHandler();
  };

  return (
    <>
      {clone}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
        <ModalContent
          bg="brand.beige"
          border="1px solid"
          borderColor="brand.green"
          borderRadius="xl"
          color="brand.green"
          boxShadow="xl"
        >
          <ModalHeader
            textAlign="center"
            fontWeight="bold"
            borderBottom="1px solid"
            borderColor="brand.green"
          >
            {title}
          </ModalHeader>
          <ModalCloseButton color="brand.green" />

          <ModalBody textAlign="center" py={6}>
            <Text>{message}</Text>
          </ModalBody>

          <ModalFooter
            justifyContent="center"
            borderTop="1px solid"
            borderColor="brand.green"
          >
            <Button
              variant="outline"
              color="brand.green"
              mr={3}
              onClick={onClose}
            >
              {closeText}
            </Button>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}