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

export default function ConfirmToggleOrgModal({
  isOpen,
  onClose,
  onConfirm,
  target,
  isLoading = false,
}) {
  const isActive = target?.is_active;
  const action = isActive ? "Deactivate" : "Activate";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        color="brand.green"
        border="1px solid"
        borderColor="brand.green"
      >
        <ModalHeader
          fontWeight="bold"
          textAlign="center"
          borderBottom="1px solid"
          borderColor="brand.green"
        >
          Confirm {action}
        </ModalHeader>

        <ModalBody textAlign="center" py={5}>
          <Text mb={2}>
            Are you sure you want to <b>{action.toLowerCase()}</b>:
          </Text>
          <Text fontWeight="bold" color={isActive ? "red.600" : "green.600"}>
            {target?.name}
          </Text>
          <Text mt={3} fontSize="sm" color="gray.600">
            {isActive
              ? "This organisation will be hidden from donors and unavailable for donations."
              : "This organisation will be made visible and active for donors again."}
          </Text>
        </ModalBody>

        <ModalFooter
          justifyContent="center"
          borderTop="1px solid"
          borderColor="brand.green"
        >
          <Button
            colorScheme={isActive ? "red" : "green"}
            mr={3}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {action}
          </Button>
          <Button variant="outline" onClick={onClose} color="brand.green">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}