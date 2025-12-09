import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";

export default function ConfirmToggleUserModal({
  isOpen,
  onClose,
  onConfirm,
  selectedUser,
  actionType, // "promote" or "deactivate"
  isLoading = false,
}) {
  const isPromotion = actionType === "promote";
  const title = isPromotion ? "Confirm Promotion" : "Confirm Deactivation";
  const actionColor = isPromotion ? "blue" : "red";
  const actionText = isPromotion ? "Promote" : "Deactivate";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        borderRadius="lg"
        border="1px solid"
        borderColor="brand.green"
        bg="white"
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

        <ModalBody textAlign="center" py={6}>
          <Text mb={3}>
            {isPromotion
              ? "Are you sure you want to promote this user to an Admin? They will gain full administrative privileges, including managing users and organisations."
              : "Are you sure you want to deactivate this user? They will no longer be able to log in or perform any actions."}
          </Text>

          <Text fontWeight="bold" mt={2}>
            {selectedUser?.first_name} {selectedUser?.last_name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {selectedUser?.email}
          </Text>
        </ModalBody>

        <ModalFooter
          justifyContent="center"
          borderTop="1px solid"
          borderColor="brand.green"
        >
          <Button
            colorScheme={actionColor}
            mr={3}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {actionText}
          </Button>
          <Button variant="outline" onClick={onClose} color="brand.green">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}