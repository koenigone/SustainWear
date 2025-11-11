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
} from "@chakra-ui/react";

export default function AddOrgModal({
  isOpen,
  onClose,
  onSubmit,
  orgData,
  setOrgData,
  isEditing = false,
  isLoading = false,
}) {
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
          <VStack spacing={3} mt={3}>
            <Input
              placeholder="Organisation Name"
              value={orgData.name}
              onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
            <Input
              placeholder="Description"
              value={orgData.description}
              onChange={(e) =>
                setOrgData({ ...orgData, description: e.target.value })
              }
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
            <Input
              placeholder="Street Name"
              value={orgData.street_name}
              onChange={(e) =>
                setOrgData({ ...orgData, street_name: e.target.value })
              }
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
            <Input
              placeholder="Post Code"
              value={orgData.post_code}
              onChange={(e) =>
                setOrgData({ ...orgData, post_code: e.target.value })
              }
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
            <Input
              placeholder="City"
              value={orgData.city}
              onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
            <Input
              placeholder="Contact Email"
              value={orgData.contact_email}
              onChange={(e) =>
                setOrgData({ ...orgData, contact_email: e.target.value })
              }
              bg="white"
              color="black"
              borderColor="brand.green"
              focusBorderColor="brand.green"
            />
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="brand.green">
          <Button
            bg="brand.green"
            color="white"
            _hover={{ bg: "green.600" }}
            mr={3}
            onClick={onSubmit}
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