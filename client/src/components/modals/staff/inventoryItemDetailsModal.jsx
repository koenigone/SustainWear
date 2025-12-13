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
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function InventoryItemModal({
  isOpen,
  onClose,
  item,
  beneficiary,
  setBeneficiary,
  distributing,
  handleDistribute,
}) {
  const [index, setIndex] = useState(0);

  // reset carousel index when a new item is opened
  useEffect(() => {
    if (item) setIndex(0);
  }, [item]);

  if (!item) return null;

  const images = item.photo_urls || [];
  const total = images.length;

  const prevImage = () => {
    setIndex((i) => (i === 0 ? total - 1 : i - 1));
  };

  const nextImage = () => {
    setIndex((i) => (i === total - 1 ? 0 : i + 1));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="brand.green">{item.item_name}</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={5} align="stretch">

            {/* IMAGE VIEWER */}
            <Box position="relative" width="100%">
              <Image
                src={images[index]}
                borderRadius="lg"
                width="100%"
                maxH="320px"
                objectFit="cover"
              />

              {/* Left arrow */}
              {total > 1 && (
                <IconButton
                  icon={<IoChevronBack size={22} />}
                  position="absolute"
                  top="50%"
                  left="10px"
                  transform="translateY(-50%)"
                  borderRadius="full"
                  onClick={prevImage}
                  bg="whiteAlpha.700"
                  _hover={{ bg: "whiteAlpha.900" }}
                  aria-label="Previous image"
                />
              )}

              {/* Right arrow */}
              {total > 1 && (
                <IconButton
                  icon={<IoChevronForward size={22} />}
                  position="absolute"
                  top="50%"
                  right="10px"
                  transform="translateY(-50%)"
                  borderRadius="full"
                  onClick={nextImage}
                  bg="whiteAlpha.700"
                  _hover={{ bg: "whiteAlpha.900" }}
                  aria-label="Next image"
                />
              )}

              {/* Dot indicators */}
              {total > 1 && (
                <Flex justify="center" mt={2} gap={1}>
                  {images.map((_, i) => (
                    <Box
                      key={i}
                      w={index === i ? "10px" : "8px"}
                      h={index === i ? "10px" : "8px"}
                      borderRadius="full"
                      bg={index === i ? "green.500" : "gray.300"}
                      cursor="pointer"
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </Flex>
              )}
            </Box>

            {/* ITEM DETAILS */}
            <VStack spacing={2} align="start">
              <HStack spacing={4}>
                <Badge colorScheme="green">{item.category}</Badge>
                <Badge colorScheme="blue">Size: {item.size}</Badge>
              </HStack>

              <Text><strong>Condition:</strong> {item.item_condition}</Text>
              <Text><strong>Gender:</strong> {item.gender || "Unspecified"}</Text>
              <Text><strong>Description:</strong> {item.description}</Text>
              <Text color="gray.600">
                <strong>Added At:</strong> {new Date(item.added_at).toLocaleString()}
              </Text>
            </VStack>

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