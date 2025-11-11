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
} from "@chakra-ui/react";

export default function ConfirmAccountDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        bg="brand.beige"
        border="1px solid"
        borderColor="brand.green"
        borderRadius="xl"
        color="brand.green"
      >
        <ModalHeader
          textAlign="center"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor="brand.green"
        >
          Confirm Account Deletion
        </ModalHeader>

        <ModalBody textAlign="center" py={6}>
          <Text mb={3}>Enter your password to confirm account deletion.</Text>
          <Input
            type="password"
            placeholder="Enter Password"
            bg="white"
            color="black"
            borderColor="brand.green"
            borderWidth="1.5px"
            borderRadius="md"
            transition="all 0.2s ease"
            _placeholder={{ color: "gray.400" }}
            _hover={{ borderColor: "brand.green" }}
            _focus={{
              borderColor: "brand.green",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
              bg: "white",
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="brand.green"
          justifyContent="center"
        >
          <Button
            bg="red.500"
            color="white"
            _hover={{ bg: "red.600" }}
            mr={3}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
          <Button variant="outline" color="brand.green" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}