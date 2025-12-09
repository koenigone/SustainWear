import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Badge,
  Image,
  Text,
  Box,
  Heading,
  Input,
  Button,
} from "@chakra-ui/react";

export default function InventoryItemModal({
  isOpen,
  onClose,
  item,
  beneficiary,
  setBeneficiary,
  distributing,
  handleDistribute,
}) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="brand.green">{item.item_name}</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={4} align="start">
            <Image
              src={item.photo_urls?.[0]}
              borderRadius="lg"
              width="100%"
              maxH="300px"
              objectFit="cover"
            />

            <HStack spacing={4}>
              <Badge colorScheme="green">{item.category}</Badge>
              <Badge colorScheme="blue">Size: {item.size}</Badge>
            </HStack>

            <Text>
              <strong>Condition:</strong> {item.item_condition}
            </Text>

            <Text>
              <strong>Gender:</strong> {item.gender || "Unspecified"}
            </Text>

            <Text>
              <strong>Description:</strong> {item.description}
            </Text>

            <Text color="gray.600">
              <strong>Added At:</strong>{" "}
              {new Date(item.added_at).toLocaleString()}
            </Text>

            {/* DISTRIBUTION FORM */}
            <Box
              w="100%"
              mt={4}
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px solid #e2e8f0"
            >
              <Heading size="sm" mb={3} color="brand.green">
                Distribute Item
              </Heading>

              <Input
                placeholder="Beneficiary group (e.g., Local Shelter)"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                mb={3}
              />

              <Button
                width="100%"
                colorScheme="green"
                isLoading={distributing}
                onClick={handleDistribute}
              >
                Confirm Distribution
              </Button>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}