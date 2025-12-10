import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { TimeFormatter } from "../../../helpers/timeFormatter";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function DonationReviewModal({
  isOpen,
  onClose,
  donation,
  statusReason,
  setStatusReason,
  handleStatusUpdate,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (donation) setIndex(0); // reset carousel when opening new donation
  }, [donation]);

  if (!donation) return null;

  const images = donation.photo_urls || [];
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
        <ModalHeader>Review Donation</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack align="stretch" spacing={6}>
            {/* IMAGE VIEWER */}
            <Box position="relative" width="100%">
              {/* MAIN IMAGE */}
              <Image
                src={images[index]}
                borderRadius="md"
                width="100%"
                maxH="320px"
                objectFit="cover"
              />

              {/* LEFT ARROW */}
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

              {/* RIGHT ARROW */}
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

              {/* DOT INDICATORS */}
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
            <VStack align="start" spacing={2}>
              <Text>
                <strong>Name:</strong> {donation.item_name}
              </Text>
              <Text>
                <strong>Category:</strong> {donation.category}
              </Text>
              <Text>
                <strong>Size:</strong> {donation.size}
              </Text>
              <Text>
                <strong>Condition:</strong> {donation.item_condition}
              </Text>
              <Text>
                <strong>Gender:</strong> {donation.gender || "Unspecified"}
              </Text>
              <Text>
                <strong>Submitted At:</strong>{" "}
                {TimeFormatter.dateToFormat(donation.submitted_at)}
              </Text>
            </VStack>

            {/* DESCRIPTION */}
            <Box>
              <Text mb={1} fontWeight="bold">
                Description
              </Text>
              <Text>{donation.description}</Text>
            </Box>

            {/* REASON */}
            <Box>
              <Text mb={1} fontWeight="bold">
                Reason (required when declining)
              </Text>
              <Input
                placeholder="Reason for decline"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </Box>

            {/* ACTION BUTTONS */}
            <HStack spacing={3} justify="flex-end">
              {donation.status === "Pending" ? (
                <>
                  <Button
                    colorScheme="green"
                    onClick={() => handleStatusUpdate("Accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleStatusUpdate("Declined")}
                  >
                    Decline
                  </Button>
                </>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  This donation has already been processed.
                </Text>
              )}
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}