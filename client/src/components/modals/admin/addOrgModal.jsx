import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { validateOrganisationForm } from "../../../rules/validateOrganisationForm";

export default function AddOrgModal({
  isOpen,
  onClose,
  onSubmit,
  orgData,
  setOrgData,
  errorMessage,
  isEditing = false,
  isLoading = false,
}) {
  if (!orgData) { // define empty orgData for safety
    orgData = {
      name: "",
      description: "",
      street_name: "",
      post_code: "",
      city: "",
      contact_email: "",
    };
  }

  const [errors, setErrors] = useState({});

  // run validation before submit
  const handleSubmit = () => {
    const validation = validateOrganisationForm(orgData);

    if (!validation.valid) {
      setErrors(validation.errors || { general: validation.message });
      return;
    }

    setErrors({});
    onSubmit();
  };

  const setField = (field, value) => {
    setOrgData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />

      <ModalContent
        bg="brand.beige"
        color="brand.green"
        borderRadius="lg"
        boxShadow="xl"
        border="1px solid"
        borderColor="brand.green"
      >
        <ModalHeader
          textAlign="center"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor="brand.green"
        >
          {isEditing ? "Edit Organisation" : "Add Organisation"}
        </ModalHeader>

        <ModalBody>
          {errors.general && (
            <Box
              bg="red.100"
              border="1px solid red"
              color="red.600"
              px={3}
              py={2}
              borderRadius="md"
              mb={2}
              fontSize="sm"
            >
              {errors.general}
            </Box>
          )}

          <VStack spacing={3} mt={3} align="stretch">
            {/* Name */}
            <Input
              placeholder="Organisation Name"
              value={orgData.name}
              onChange={(e) => setField("name", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.name ? "red.500" : "brand.green"}
            />
            {errors.name && <Text color="red.500">{errors.name}</Text>}

            {/* Description */}
            <Input
              placeholder="Description"
              value={orgData.description}
              onChange={(e) => setField("description", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.description ? "red.500" : "brand.green"}
            />
            {errors.description && (
              <Text color="red.500">{errors.description}</Text>
            )}

            {/* Street */}
            <Input
              placeholder="Street Name"
              value={orgData.street_name}
              onChange={(e) => setField("street_name", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.street_name ? "red.500" : "brand.green"}
            />
            {errors.street_name && (
              <Text color="red.500">{errors.street_name}</Text>
            )}

            {/* Post Code */}
            <Input
              placeholder="Post Code"
              value={orgData.post_code}
              onChange={(e) => setField("post_code", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.post_code ? "red.500" : "brand.green"}
            />
            {errors.post_code && (
              <Text color="red.500">{errors.post_code}</Text>
            )}

            {/* City */}
            <Input
              placeholder="City"
              value={orgData.city}
              onChange={(e) => setField("city", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.city ? "red.500" : "brand.green"}
            />
            {errors.city && <Text color="red.500">{errors.city}</Text>}

            {/* Email */}
            <Input
              placeholder="Contact Email"
              value={orgData.contact_email}
              onChange={(e) => setField("contact_email", e.target.value)}
              bg="white"
              color="black"
              borderColor={errors.contact_email ? "red.500" : "brand.green"}
            />
            {errors.contact_email && (
              <Text color="red.500">{errors.contact_email}</Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="brand.green">
          <Button
            bg="brand.green"
            color="white"
            _hover={{ bg: "green.600" }}
            mr={3}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? "Save Changes" : "Save"}
          </Button>

          <Button variant="outline" color="brand.green" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}