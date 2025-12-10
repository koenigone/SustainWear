import {
  Box,
  VStack,
  Flex,
  Text,
  Spinner,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Heading,
  Input,
  Button,
  Select,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axiosClient";
import { TimeFormatter } from "../../../helpers/timeFormatter";
import { useAuth } from "../../../auth/authContext";
import toast from "react-hot-toast";
import DonationReviewModal from "../../../components/modals/staff/donationReviewModal";

export default function IncomingDonations() {
  const { organisation, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [statusReason, setStatusReason] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const isMobile = useBreakpointValue({ base: true, md: false });

  // fetch donations
  useEffect(() => {
    if (!organisation?.org_id) return;

    setLoading(true);
    api
      .get(`/orgs/${organisation.org_id}/donation-requests`)
      .then((res) => {
        setDonations(res.data);
      })
      .catch((err) => {
        console.error("Error fetching incoming donations:", err);
        toast.error("Failed to load incoming donations.");
      })
      .finally(() => setLoading(false));
  }, [organisation]);

  // filter option values
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(donations.map((d) => d.category).filter(Boolean))
      ).sort(),
    [donations]
  );

  const conditionOptions = useMemo(
    () =>
      Array.from(
        new Set(donations.map((d) => d.item_condition).filter(Boolean))
      ).sort(),
    [donations]
  );

  const sizeOptions = useMemo(
    () =>
      Array.from(new Set(donations.map((d) => d.size).filter(Boolean))).sort(),
    [donations]
  );

  const genderOptions = useMemo(
    () =>
      Array.from(
        new Set(donations.map((d) => d.gender).filter(Boolean))
      ).sort(),
    [donations]
  );

  // filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const searchNorm = search.trim().toLowerCase();

      const matchesSearch =
        !searchNorm ||
        donation.item_name.toLowerCase().includes(searchNorm) ||
        donation.category.toLowerCase().includes(searchNorm);

      const matchesStatus =
        !filterStatus || filterStatus === "All"
          ? true
          : donation.status === filterStatus;

      const matchesCategory =
        !filterCategory || donation.category === filterCategory;

      const matchesCondition =
        !filterCondition || donation.item_condition === filterCondition;

      const matchesSize = !filterSize || donation.size === filterSize;

      const matchesGender = !filterGender || donation.gender === filterGender;

      let matchesDate = true;
      if (filterDateFrom) {
        matchesDate =
          matchesDate &&
          new Date(donation.submitted_at) >= new Date(filterDateFrom);
      }
      if (filterDateTo) {
        matchesDate =
          matchesDate &&
          new Date(donation.submitted_at) <= new Date(filterDateTo);
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesCondition &&
        matchesSize &&
        matchesGender &&
        matchesDate
      );
    });
  }, [
    donations,
    search,
    filterStatus,
    filterCategory,
    filterCondition,
    filterSize,
    filterGender,
    filterDateFrom,
    filterDateTo,
  ]);

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("Pending");
    setFilterCategory("");
    setFilterCondition("");
    setFilterSize("");
    setFilterGender("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const openReviewModal = (donation) => {
    setSelectedDonation(donation);
    setStatusReason("");
    onOpen();
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedDonation) return;

    // reason is mandatory for Declined
    if (newStatus === "Declined") {
      if (!statusReason || statusReason.trim().length === 0) {
        toast.error("Please provide a reason for this action.");
        return;
      }
    }

    try {
      const transaction_id = selectedDonation.transaction_id;

      await api.post(`/orgs/${transaction_id}/donation-request-update`, {
        status: newStatus,
        handled_by_staff_id: user.user_id,
        reason: statusReason,
      });

      // update local state
      setDonations((prev) =>
        prev.map((don) =>
          don.transaction_id === transaction_id
            ? { ...don, status: newStatus }
            : don
        )
      );

      toast.success("Donation status updated successfully.");

      // if filtered by Pending, the item will disappear from the list automatically
      onClose();
      setSelectedDonation(null);
    } catch (err) {
      console.error("Error updating donation status:", err);
      toast.error("Failed to update donation status.");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.green" />
        <Text mt={4} color="gray.600">
          Loading incoming donations…
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* FILTER BAR */}
      <Box mb={4} p={4} bg="white" borderRadius="lg" boxShadow="sm">
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align={{ base: "stretch", md: "flex-end" }}
          flexWrap="wrap"
        >
          <Box flex="1">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Search
            </Text>
            <Input
              placeholder="Search by item or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Status
            </Text>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              minW="150px"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </Select>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Category
            </Text>
            <Select
              placeholder="All"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              minW="150px"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Condition
            </Text>
            <Select
              placeholder="All"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              minW="170px"
            >
              {conditionOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Size
            </Text>
            <Select
              placeholder="All"
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              minW="110px"
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Gender
            </Text>
            <Select
              placeholder="All"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              minW="130px"
            >
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              From
            </Text>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              minW="150px"
            />
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.600" mb={1}>
              To
            </Text>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              minW="150px"
            />
          </Box>

          <Button onClick={clearFilters} variant="outline" minW="120px">
            Clear Filters
          </Button>
        </Flex>
      </Box>

      {/* CONTENT */}
      {filteredDonations.length === 0 ? (
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="sm"
          textAlign="center"
        >
          <Text color="gray.600">No donations match the current filters.</Text>
        </Box>
      ) : !isMobile ? (
        // DESKTOP TABLE VIEW
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Item</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Submitted At</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDonations.map((donation) => (
                <Tr key={donation.transaction_id}>
                  <Td>{donation.item_name}</Td>
                  <Td>{donation.category}</Td>
                  <Td>{donation.status}</Td>
                  <Td>{TimeFormatter.dateToFormat(donation.submitted_at)}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => openReviewModal(donation)}
                    >
                      Review
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        // MOBILE CARD VIEW
        <VStack spacing={4} align="stretch">
          {filteredDonations.map((donation) => (
            <Box
              key={donation.transaction_id}
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="sm"
            >
              <Heading size="sm" mb={1}>
                {donation.item_name}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {donation.category} • {donation.size} •{" "}
                {donation.item_condition}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Status: {donation.status} • Submitted:{" "}
                {TimeFormatter.dateToFormat(donation.submitted_at)}
              </Text>

              <Button
                mt={3}
                size="sm"
                w="100%"
                colorScheme="green"
                onClick={() => openReviewModal(donation)}
              >
                Review
              </Button>
            </Box>
          ))}
        </VStack>
      )}

      {/* REVIEW MODAL */}
      {selectedDonation && (
        <DonationReviewModal
          isOpen={isOpen}
          onClose={onClose}
          donation={selectedDonation}
          statusReason={statusReason}
          setStatusReason={setStatusReason}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}
    </Box>
  );
}