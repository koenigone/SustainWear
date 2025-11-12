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
  HStack,
  Heading,
  Spinner,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import AddOrgModal from "../../../components/modals/addOrgModal.jsx";
import ConfirmToggleOrgModal from "../../../components/modals/confirmToggleOrgModal.jsx";
import ConfirmOrgDeletionModal from "../../../components/modals/confirmOrgDeletionModal.jsx";

export default function ManageOrganisations() {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orgToToggle, setOrgToToggle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toggleModal = useDisclosure();
  const initialOrgData = {
    name: "",
    description: "",
    street_name: "",
    post_code: "",
    city: "",
    contact_email: "",
  };
  const [newOrg, setNewOrg] = useState(initialOrgData);


  const fetchOrganisations = async () => { // fench all organisations
    try {
      const res = await api.get("/admin/organisations");
      setOrgs(res.data);
      setFilteredOrgs(res.data);
    } catch {
      toast.error("Failed to load organisations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // initial fetch
    fetchOrganisations();
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

      setNewOrg(initialOrgData);
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
    setIsProcessing(true);

    try {
      await api.put("/admin/organisations/status", {
        org_id: orgToToggle.org_id,
        is_active: !orgToToggle.is_active,
      });

      toast.success(
        `Organisation "${orgToToggle.name}" ${orgToToggle.is_active ? "deactivated" : "activated"
        } successfully`
      );

      await fetchOrganisations();
    } catch {
      toast.error("Failed to update organisation status");
    } finally {
      setIsProcessing(false);
      toggleModal.onClose();
      setOrgToToggle(null);
    }
  };

  // confirm delete
  const confirmDelete = (org) => {
    setOrgToDelete(org);
    deleteModal.onOpen();
  };

  // delete organisation
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/organisations/${orgToDelete.org_id}`);
      toast.success("Organisation deleted successfully");
      fetchOrganisations(); // refresh table
    } catch {
      toast.error("Failed to delete organisation");
    } finally {
      setIsDeleting(false);
      deleteModal.onClose();
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
                <Td maxW="300px" whiteSpace="normal" wordBreak="break-word">
                  {org.description}
                </Td>
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
                  <Flex justify="center" align="center" gap={2}>
                    <Button
                      size="sm"
                      w="100px"
                      colorScheme={org.is_active ? "yellow" : "green"}
                      onClick={() => confirmToggle(org)}
                    >
                      {org.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      w="100px"
                      colorScheme="red"
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

      {/* ADD ORGANISATION MODAL */}
      <AddOrgModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSubmit={handleCreate}
        orgData={newOrg}
        setOrgData={setNewOrg}
      />

      {/* TOGGLE ORG ACTIVATION MODAL */}
      <ConfirmToggleOrgModal
        isOpen={toggleModal.isOpen}
        onClose={toggleModal.onClose}
        onConfirm={handleToggleActive}
        target={orgToToggle}
        isLoading={isProcessing}
      />

      {/* DELETE ORGANISATION MODAL */}
      <ConfirmOrgDeletionModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={handleDelete}
        target={orgToDelete}
        entityName="organisation"
        isLoading={isDeleting}
      />

    </Box>
  );
}