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

export default function ConfirmOrgDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  target,
  isLoading = false,
  entityName = "item", // optional label e.g "organisation", "user", etc
}) {
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
          Confirm Deletion
        </ModalHeader>

        <ModalBody textAlign="center" py={5}>
          <Text mb={2}>
            Are you sure you want to delete this {entityName}?
          </Text>
          <Text fontWeight="bold" color="red.600">
            {target?.name}
          </Text>
          <Text mt={3} fontSize="sm" color="gray.600">
            This action cannot be undone.
          </Text>
        </ModalBody>

        <ModalFooter
          justifyContent="center"
          borderTop="1px solid"
          borderColor="brand.green"
        >
          <Button
            colorScheme="red"
            mr={3}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            color="brand.green"
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}