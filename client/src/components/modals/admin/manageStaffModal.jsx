import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

export default function ManageStaffModal({
  isOpen,
  onClose,
  selectedOrg,
  staffList,
  removeStaff,
  assignByEmail,
}) {
  const [search, setSearch] = useState("");
  const [emailToAdd, setEmailToAdd] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // filter staff currently assigned
  const filtered = staffList.filter((s) => {
    const t = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(t) ||
      s.last_name.toLowerCase().includes(t) ||
      s.email.toLowerCase().includes(t)
    );
  });

  // hire staff by email (delegates to parent)
  const handleAssign = async () => {
    if (!emailToAdd.trim()) return;
    setIsAdding(true);

    const ok = await assignByEmail(emailToAdd);
    if (ok) setEmailToAdd("");

    setIsAdding(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="rgba(0,0,0,0.4)" />

      <ModalContent
        bg="brand.beige"
        border="1px solid"
        borderColor="brand.green"
        borderRadius="xl"
        color="brand.green"
      >
        <ModalHeader textAlign="center" fontWeight="bold">
          Manage Staff — {selectedOrg?.name}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={3} mb={6}>
            <Text fontWeight="bold" color="brand.green">
              Hire New Staff Member
            </Text>

            <Flex w="100%" gap={2}>
              <Input
                placeholder="Enter user email..."
                value={emailToAdd}
                onChange={(e) => setEmailToAdd(e.target.value)}
                bg="white"
                color="black"
                borderColor="brand.green"
                _placeholder={{ color: "gray.400" }}
              />

              <Button
                bg="brand.green"
                color="white"
                _hover={{ bg: "green.700" }}
                onClick={handleAssign}
                isLoading={isAdding}
              >
                Hire
              </Button>
            </Flex>
          </VStack>

          <Input
            placeholder="Search current staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            _placeholder={{ color: "gray.400" }}
            mb={4}
            bg="white"
            color="black"
            borderColor="brand.green"
          />

          {filtered.length === 0 ? (
            <Text textAlign="center" mt={6} color="gray.500">
              No staff members found.
            </Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filtered.map((staff) => (
                  <Tr key={staff.user_id}>
                    <Td>
                      {staff.first_name} {staff.last_name}
                    </Td>
                    <Td>{staff.email}</Td>

                    <Td>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => removeStaff(staff)}
                      >
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="brand.green"
          justifyContent="center"
        >
          <Button variant="outline" color="brand.green" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}