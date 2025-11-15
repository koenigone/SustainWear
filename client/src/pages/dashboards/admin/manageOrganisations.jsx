import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  VStack,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  Heading,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";

import api from "../../../api/axiosClient";
import toast from "react-hot-toast";

import AddOrgModal from "../../../components/modals/addOrgModal.jsx";
import ConfirmToggleOrgModal from "../../../components/modals/confirmToggleOrgModal.jsx";
import ConfirmOrgDeletionModal from "../../../components/modals/confirmOrgDeletionModal.jsx";
import ManageStaffModal from "../../../components/modals/manageStaffModal.jsx";

export default function ManageOrganisations() {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const [orgToDelete, setOrgToDelete] = useState(null);
  const [orgToToggle, setOrgToToggle] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toggleModal = useDisclosure();
  const staffModal = useDisclosure();

  const initialOrgData = {
    name: "",
    description: "",
    street_name: "",
    post_code: "",
    city: "",
    contact_email: "",
  };

  const [newOrg, setNewOrg] = useState(initialOrgData);

  // fetch all organisations
  const fetchOrganisations = async () => {
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

  // initial fetch
  useEffect(() => {
    fetchOrganisations();
  }, []);

  // filter search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredOrgs(
      orgs.filter(
        (org) =>
          org.name.toLowerCase().includes(term) ||
          org.city.toLowerCase().includes(term) ||
          org.contact_email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, orgs]);

  // create new organisation
  const handleOrgCreate = async () => {
    try {
      await api.post("/admin/organisations", newOrg);
      toast.success("Organisation added successfully");
      addModal.onClose();

      fetchOrganisations();
      setNewOrg(initialOrgData);
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to create organisation");
    }
  };

  // open toggle confirmation
  const confirmOrgToggle = (org) => {
    setOrgToToggle(org);
    toggleModal.onOpen();
  };

  // activate/deactivate organisation
  const handleOrgToggleActive = async () => {
    if (!orgToToggle) return;
    setIsProcessing(true);

    try {
      await api.put("/admin/organisations/status", {
        org_id: orgToToggle.org_id,
        is_active: !orgToToggle.is_active,
      });

      toast.success(
        `Organisation "${orgToToggle.name}" ${orgToToggle.is_active ? "deactivated" : "activated"
        }`
      );

      fetchOrganisations();
    } catch {
      toast.error("Failed to update organisation status");
    } finally {
      setIsProcessing(false);
      toggleModal.onClose();
      setOrgToToggle(null);
    }
  };

  // confirm delete
  const confirmOrgDelete = (org) => {
    setOrgToDelete(org);
    deleteModal.onOpen();
  };

  // delete organisation
  const handleOrgDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/organisations/${orgToDelete.org_id}`);
      toast.success("Organisation deleted");
      fetchOrganisations();
    } catch {
      toast.error("Failed to delete organisation");
    } finally {
      setIsDeleting(false);
      deleteModal.onClose();
    }
  };

  // open manage staff modal
  const openStaffModal = async (org) => {
    setSelectedOrg(org);
    staffModal.onOpen();

    const res = await api.get(`/admin/org/${org.org_id}/staff`);
    setStaffList(res.data);
  };

  const refreshStaff = async (orgId) => {
    const res = await api.get(`/admin/org/${orgId}/staff`);
    setStaffList(res.data);
  };

  // hire staff
  const assignStaffByEmail = async (email) => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return false;
    }

    try {
      await api.post(`/admin/org/${selectedOrg.org_id}/staff`, { email });

      toast.success("Staff member added");
      await refreshStaff(selectedOrg.org_id);

      // refresh staff
      const res = await api.get(`/admin/org/${selectedOrg.org_id}/staff`);
      setStaffList(res.data);

      return true; // success
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Failed to add staff");
      return false;
    }
  };

  // remove staff
  const removeStaff = async (staff) => {
    await api.delete(`/admin/org/${selectedOrg.org_id}/staff/${staff.user_id}`);
    setStaffList((prev) => prev.filter((s) => s.user_id !== staff.user_id));
  };

  // activate/deactivate staff
  const toggleStaffActive = async (staff) => {
    await api.put(`/admin/org/${selectedOrg.org_id}/staff/${staff.user_id}`, {
      is_active: !staff.is_active,
    });

    setStaffList((prev) =>
      prev.map((s) =>
        s.user_id === staff.user_id ? { ...s, is_active: !s.is_active } : s
      )
    );
  };

  if (loading) return <Spinner size="xl" />;

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

                <Td color={org.is_active ? "green.500" : "red.500"} fontWeight="bold">
                  {org.is_active ? "Active" : "Inactive"}
                </Td>

                <Td>{new Date(org.created_at).toLocaleDateString()}</Td>

                <Td>
                  <VStack spacing={2} justify="center" align="center">
                    <Button
                      size="sm"
                      w="120px"
                      colorScheme="orange"
                      onClick={() => openStaffModal(org)}
                    >
                      Manage Staff
                    </Button>

                    <Button
                      size="sm"
                      w="120px"
                      colorScheme={org.is_active ? "yellow" : "green"}
                      onClick={() => confirmOrgToggle(org)}
                    >
                      {org.is_active ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      w="120px"
                      colorScheme="red"
                      onClick={() => confirmOrgDelete(org)}
                    >
                      Delete
                    </Button>
                  </VStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* ADD ORG */}
      <AddOrgModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSubmit={handleOrgCreate}
        orgData={newOrg}
        setOrgData={setNewOrg}
      />

      {/* MANAGE STAFF */}
      <ManageStaffModal
        isOpen={staffModal.isOpen}
        onClose={staffModal.onClose}
        selectedOrg={selectedOrg}
        staffList={staffList}
        removeStaff={removeStaff}
        toggleStaffActive={toggleStaffActive}
        assignByEmail={assignStaffByEmail}
      />

      {/* TOGGLE ORG */}
      <ConfirmToggleOrgModal
        isOpen={toggleModal.isOpen}
        onClose={toggleModal.onClose}
        onConfirm={handleOrgToggleActive}
        target={orgToToggle}
        isLoading={isProcessing}
      />

      {/* DELETE ORG */}
      <ConfirmOrgDeletionModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={handleOrgDelete}
        target={orgToDelete}
        entityName="organisation"
        isLoading={isDeleting}
      />
    </Box>
  );
}