import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Stack,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  HStack,
  Spinner,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";

import api from "../../../api/axiosClient";
import toast from "react-hot-toast";

import AddOrgModal from "../../../components/modals/admin/addOrgModal";
import ConfirmToggleOrgModal from "../../../components/modals/admin/confirmToggleOrgModal";
import ManageStaffModal from "../../../components/modals/admin/manageStaffModal";
import { validateOrganisationForm } from "../../../rules/validateOrganisationForm.js";

export default function ManageOrganisations() {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const [orgToToggle, setOrgToToggle] = useState(null);
  const [orgError, setOrgError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const addModal = useDisclosure();
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

  // fetch organisations
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

  useEffect(() => {
    fetchOrganisations();
  }, []);

  // search
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

  // create org
  const handleOrgCreate = async () => {
    const validation = validateOrganisationForm(newOrg);
    if (!validation.valid) {
      setOrgError(validation.message);
      return;
    }

    setOrgError("");
    try {
      await api.post("/admin/organisations", newOrg);
      toast.success("Organisation added successfully");
      addModal.onClose();
      fetchOrganisations();
      setNewOrg(initialOrgData);
    } catch (err) {
      setOrgError(
        err.response?.data?.message ||
          err.response?.data?.errMessage ||
          "Failed to create organisation"
      );
    }
  };

  // toggle org
  const confirmOrgToggle = (org) => {
    setOrgToToggle(org);
    toggleModal.onOpen();
  };

  const handleOrgToggleActive = async () => {
    if (!orgToToggle) return;
    setIsProcessing(true);

    try {
      await api.put("/admin/organisations/status", {
        org_id: orgToToggle.org_id,
        is_active: !orgToToggle.is_active,
      });

      toast.success(
        `Organisation "${orgToToggle.name}" ${
          orgToToggle.is_active ? "deactivated" : "activated"
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

  // manage staff
  const openStaffModal = async (org) => {
    setSelectedOrg(org);
    staffModal.onOpen();
    const res = await api.get(`/admin/org/${org.org_id}/staff`);
    setStaffList(res.data);
  };

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={{ base: 4, md: 6 }} bg="white" rounded="lg" boxShadow="md">
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <Input
          placeholder="Search organisations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="400px"
        />
        <Button colorScheme="green" onClick={addModal.onOpen}>
          Add Organisation
        </Button>
      </HStack>

      {filteredOrgs.length === 0 ? (
        <Text color="gray.500">No organisations found</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 1 }} spacing={4}>
          {filteredOrgs.map((org) => (
            <Box
              key={org.org_id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              _hover={{ boxShadow: "md" }}
            >
              <Stack spacing={3}>
                {/* Header */}
                <HStack justify="space-between">
                  <Heading size="sm">{org.name}</Heading>
                  <Badge colorScheme={org.is_active ? "green" : "red"}>
                    {org.is_active ? "Active" : "Inactive"}
                  </Badge>
                </HStack>

                {/* Meta */}
                <Text fontSize="sm" color="gray.600">
                  {org.description}
                </Text>

                <Divider />

                <Stack spacing={1} fontSize="sm">
                  <Text>
                    <strong>Address:</strong> {org.street_name},{" "}
                    {org.post_code}, {org.city}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {org.contact_email}
                  </Text>
                  <Text>
                    <strong>Created:</strong>{" "}
                    {new Date(org.created_at).toLocaleDateString()}
                  </Text>
                </Stack>

                {/* Actions */}
                <HStack pt={2} spacing={3} flexWrap="wrap">
                  <Button
                    size="sm"
                    colorScheme="orange"
                    onClick={() => openStaffModal(org)}
                  >
                    Manage Staff
                  </Button>

                  <Button
                    size="sm"
                    colorScheme={org.is_active ? "yellow" : "green"}
                    onClick={() => confirmOrgToggle(org)}
                  >
                    {org.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </HStack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* ADD ORG */}
      <AddOrgModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSubmit={handleOrgCreate}
        orgData={newOrg}
        setOrgData={setNewOrg}
        errorMessage={orgError}
      />

      {/* MANAGE STAFF */}
      <ManageStaffModal
        isOpen={staffModal.isOpen}
        onClose={staffModal.onClose}
        selectedOrg={selectedOrg}
        staffList={staffList}
      />

      {/* TOGGLE ORG */}
      <ConfirmToggleOrgModal
        isOpen={toggleModal.isOpen}
        onClose={toggleModal.onClose}
        onConfirm={handleOrgToggleActive}
        target={orgToToggle}
        isLoading={isProcessing}
      />
    </Box>
  );
}