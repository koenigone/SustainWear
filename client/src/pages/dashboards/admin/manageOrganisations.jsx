import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Flex,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  HStack,
  Heading,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";

export default function ManageOrganisations() {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrg, setNewOrg] = useState({
    name: "",
    description: "",
    street_name: "",
    post_code: "",
    city: "",
    contact_email: "",
  });
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [orgToToggle, setOrgToToggle] = useState(null);

  const addModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toggleModal = useDisclosure();

  useEffect(() => { // fetch all orgs
    api
      .get("/admin/organisations")
      .then((res) => setOrgs(res.data))
      .catch(() => toast.error("Failed to load organisations"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { // real time search filtering
    const term = searchTerm.toLowerCase();
    const filtered = orgs.filter(
      (org) =>
        org.name.toLowerCase().includes(term) ||
        org.city.toLowerCase().includes(term) ||
        org.contact_email.toLowerCase().includes(term)
    );
    setFilteredOrgs(filtered);
  }, [searchTerm, orgs]);

  // create new organisation
  const handleCreate = async () => {
    try {
      await api.post("/admin/organisations", newOrg);
      toast.success("Organisation added successfully");
      addModal.onClose();

      const res = await api.get("/admin/organisations");
      setOrgs(res.data);

      setNewOrg({
        name: "",
        description: "",
        street_name: "",
        post_code: "",
        city: "",
        contact_email: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to create organisation");
    }
  };

  // handle toggle with confirmation modal
  const confirmToggle = (org) => {
    setOrgToToggle(org);
    toggleModal.onOpen();
  };

  const handleToggleActive = async () => {
    if (!orgToToggle) return;

    try {
      await api.put("/admin/organisations/status", {
        org_id: orgToToggle.org_id,
        is_active: !orgToToggle.is_active,
      });

      toast.success(
        `Organisation "${orgToToggle.name}" ${orgToToggle.is_active ? "deactivated" : "activated"
        } successfully`
      );

      setOrgs((prev) =>
        prev.map((o) =>
          o.org_id === orgToToggle.org_id
            ? { ...o, is_active: !orgToToggle.is_active }
            : o
        )
      );

      toggleModal.onClose();
      setOrgToToggle(null);
    } catch {
      toast.error("Failed to update organisation status");
    }
  };

  // confirm delete
  const confirmDelete = (org) => {
    setOrgToDelete(org);
    deleteModal.onOpen();
  };

  // delete organisation
  const handleDelete = async () => {
    if (!orgToDelete) return;

    try {
      await api.delete(`/admin/organisations/${orgToDelete.org_id}`);
      toast.success(`Organisation "${orgToDelete.name}" deleted`);
      setOrgs((prev) => prev.filter((o) => o.org_id !== orgToDelete.org_id));
      deleteModal.onClose();
      setOrgToDelete(null);
    } catch {
      toast.error("Failed to delete organisation");
    }
  };

  if (loading) return <Spinner size="xl" />; // chakraUI's laoding spinner

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Manage Organisations</Heading>
        <Button colorScheme="green" onClick={addModal.onOpen}>
          Add Organisation
        </Button>
      </HStack>

      <Input
        placeholder="Search by name, city, or email..."
        _placeholder={{ color: "gray.400" }}
        mb={4}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        bg="gray.50"
        borderColor="gray.300"
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Address</Th>
            <Th>Contact Email</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredOrgs.length === 0 ? (
            <Tr>
              <Td colSpan={7} textAlign="center" color="gray.500">
                No organisations found
              </Td>
            </Tr>
          ) : (
            filteredOrgs.map((org) => (
              <Tr key={org.org_id}>
                <Td>{org.name}</Td>
                <Td maxW="300px" whiteSpace="normal" wordBreak="break-word">{org.description}</Td>

                <Td>
                  {org.street_name}, {org.post_code}, {org.city}
                </Td>
                <Td>{org.contact_email}</Td>
                <Td>
                  <Text color={org.is_active ? "green.500" : "red.500"} fontWeight="bold">
                    {org.is_active ? "Active" : "Inactive"}
                  </Text>
                </Td>
                <Td>{new Date(org.created_at).toLocaleDateString()}</Td>
                <Td>
                  <Flex justify="center" align="center" gap={3}>
                    <Button
                      size="sm"
                      colorScheme={org.is_active ? "yellow" : "green"}
                      w="100px"
                      onClick={() => confirmToggle(org)}
                    >
                      {org.is_active ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      colorScheme="red"
                      w="100px"
                      onClick={() => confirmDelete(org)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} isCentered>
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
            Add Organisation
          </ModalHeader>

          <ModalBody>
            <VStack spacing={3} mt={3}>
              <Input
                placeholder="Organisation Name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                bg="white"
                color="black"
                borderColor="brand.green"
                focusBorderColor="brand.green"
              />
              <Input
                placeholder="Description"
                value={newOrg.description}
                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                bg="white"
                color="black"
                borderColor="brand.green"
                focusBorderColor="brand.green"
              />
              <Input
                placeholder="Street Name"
                value={newOrg.street_name}
                onChange={(e) => setNewOrg({ ...newOrg, street_name: e.target.value })}
                bg="white"
                color="black"
                borderColor="brand.green"
                focusBorderColor="brand.green"
              />
              <Input
                placeholder="Post Code"
                value={newOrg.post_code}
                onChange={(e) => setNewOrg({ ...newOrg, post_code: e.target.value })}
                bg="white"
                color="black"
                borderColor="brand.green"
                focusBorderColor="brand.green"
              />
              <Input
                placeholder="City"
                value={newOrg.city}
                onChange={(e) => setNewOrg({ ...newOrg, city: e.target.value })}
                bg="white"
                color="black"
                borderColor="brand.green"
                focusBorderColor="brand.green"
              />
              <Input
                placeholder="Contact Email"
                value={newOrg.contact_email}
                onChange={(e) =>
                  setNewOrg({ ...newOrg, contact_email: e.target.value })
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
              onClick={handleCreate}
            >
              Save
            </Button>
            <Button variant="outline" color="brand.green" onClick={addModal.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={toggleModal.isOpen} onClose={toggleModal.onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
        <ModalContent bg="white" borderRadius="lg" boxShadow="xl" color="brand.green">
          <ModalHeader fontWeight="bold" textAlign="center">
            Confirm {orgToToggle?.is_active ? "Deactivation" : "Activation"}
          </ModalHeader>
          <ModalBody textAlign="center" py={5}>
            <Text mb={2}>
              Are you sure you want to{" "}
              <b>{orgToToggle?.is_active ? "deactivate" : "activate"}</b>:
            </Text>
            <Text fontWeight="bold" color={orgToToggle?.is_active ? "red.600" : "green.600"}>
              {orgToToggle?.name}
            </Text>
            <Text mt={3} fontSize="sm" color="gray.600">
              {orgToToggle?.is_active
                ? "This organisation will be hidden from donors and unavailable for donations."
                : "This organisation will be made visible and active for donors again."}
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              colorScheme={orgToToggle?.is_active ? "red" : "green"}
              mr={3}
              onClick={handleToggleActive}
            >
              {orgToToggle?.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="outline" onClick={toggleModal.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
        <ModalContent bg="white" borderRadius="lg" boxShadow="xl" color="brand.green">
          <ModalHeader fontWeight="bold" textAlign="center">
            Confirm Deletion
          </ModalHeader>
          <ModalBody textAlign="center" py={5}>
            <Text mb={2}>Are you sure you want to delete:</Text>
            <Text fontWeight="bold" color="red.600">
              {orgToDelete?.name}
            </Text>
            <Text mt={3} fontSize="sm" color="gray.600">
              This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button colorScheme="red" mr={3} onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={deleteModal.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}