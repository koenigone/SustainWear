import {
  VStack,
  HStack,
  Box,
  Table,
  Text,
  Spinner,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Image,
  SimpleGrid,
  Input,
  Select,
  Button,
  useBreakpointValue,
  Collapse,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axiosClient";
import { TimeFormatter } from "../../../helpers/timeFormatter";

export default function DonationHistory() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [rows, setRows] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // FILTER STATES
  const [searchValue, setSearchValue] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // MOBILE FILTER TOGGLE
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleIndex = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  const tableHeaders = [
    "Item Name",
    "Category",
    "Status",
    "Submitted At",
    "Description",
    "Size",
    "Condition",
    "Gender",
    "Image",
  ];

  // FETCH DONATION HISTORY
  useEffect(() => {
    api
      .get("/donor/donations/history")
      .then((res) => setDonations(res.data))
      .catch((err) => console.error("Failed to load donation history", err))
      .finally(() => setLoading(false));
  }, []);

  // filter option values
  const categoryOptions = useMemo(
    () => Array.from(new Set(donations.map((d) => d.category))).sort(),
    [donations]
  );

  const conditionOptions = useMemo(
    () => Array.from(new Set(donations.map((d) => d.item_condition))).sort(),
    [donations]
  );

  const sizeOptions = useMemo(
    () => Array.from(new Set(donations.map((d) => d.size))).sort(),
    [donations]
  );

  const genderOptions = useMemo(
    () => Array.from(new Set(donations.map((d) => d.gender))).sort(),
    [donations]
  );

  const statusOptions = ["Pending", "Accepted", "Declined"];

  // filter and search donations
  const filteredRows = useMemo(() => {
    return donations.filter((donation) => {
      const searchNorm = searchValue.trim().toLowerCase();

      const matchesSearch =
        !searchNorm ||
        donation.item_name.toLowerCase().includes(searchNorm) ||
        donation.category.toLowerCase().includes(searchNorm);

      const matchesCategory =
        !filterCategory || donation.category === filterCategory;

      const matchesCondition =
        !filterCondition || donation.item_condition === filterCondition;

      const matchesSize = !filterSize || donation.size === filterSize;

      const matchesGender = !filterGender || donation.gender === filterGender;

      const matchesStatus = !filterStatus || donation.status === filterStatus;

      let matchesDate = true;
      if (filterDateFrom)
        matchesDate =
          matchesDate &&
          new Date(donation.submitted_at) >= new Date(filterDateFrom);

      if (filterDateTo)
        matchesDate =
          matchesDate &&
          new Date(donation.submitted_at) <= new Date(filterDateTo);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesSize &&
        matchesGender &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    donations,
    searchValue,
    filterCategory,
    filterCondition,
    filterSize,
    filterGender,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  // turn filtered donations into table rows
  useEffect(() => {
    const parsed = filteredRows.map((donation) => [
      donation.item_name,
      donation.category,
      donation.status,
      TimeFormatter.dateToFormat(donation.submitted_at),
      donation.description,
      donation.size,
      donation.item_condition,
      donation.gender,
      donation.photo_urls?.[0] ?? "",
    ]);

    setRows(parsed);
  }, [filteredRows]);

  const clearFilters = () => {
    setSearchValue("");
    setFilterCategory("");
    setFilterCondition("");
    setFilterSize("");
    setFilterGender("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      {/* MOBILE FILTER BUTTON */}
      {isMobile && (
        <Button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          w="full"
          colorScheme="green"
          borderRadius="0"
        >
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      )}

      {/* FILTER BAR (COLLAPSIBLE ON MOBILE) */}
      <Collapse in={!isMobile || showMobileFilters} animateOpacity>
        <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={4}>
          <HStack wrap="wrap" spacing={4} align="flex-end">
            {/* Search */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Search
              </Text>
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                width="180px"
              />
            </Box>

            {/* Category */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Category
              </Text>
              <Select
                placeholder="All"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                width="150px"
              >
                {categoryOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Box>

            {/* Condition */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Condition
              </Text>
              <Select
                placeholder="All"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                width="150px"
              >
                {conditionOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Box>

            {/* Size */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Size
              </Text>
              <Select
                placeholder="All"
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                width="120px"
              >
                {sizeOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Box>

            {/* Gender */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Gender
              </Text>
              <Select
                placeholder="All"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                width="120px"
              >
                {genderOptions.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </Box>

            {/* Status */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                Status
              </Text>
              <Select
                placeholder="All"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                width="150px"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Box>

            {/* Date From */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                From
              </Text>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                width="160px"
              />
            </Box>

            {/* Date To */}
            <Box>
              <Text fontSize="xs" color="gray.600">
                To
              </Text>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                width="160px"
              />
            </Box>

            <Button onClick={clearFilters} variant="outline" ml="auto">
              Clear Filters
            </Button>
          </HStack>
        </Box>
      </Collapse>

      {/* TABLE RESULTS */}
      {rows.length === 0 ? (
        <Text>No donation history found.</Text>
      ) : (
        <Table variant="simple">
          <Thead bg="white" position="sticky" top={0} zIndex={2}>
            <Tr>
              {tableHeaders.slice(0, 3).map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <Tr
                  onClick={() => toggleIndex(i)}
                  cursor="pointer"
                  bg={expandedIndex === i ? "gray.100" : "white"}
                >
                  {row.slice(0, 3).map((cell, j) => (
                    <Td key={j}>{cell}</Td>
                  ))}
                </Tr>

                {expandedIndex === i && (
                  <Tr>
                    <Td colSpan={3}>
                      <VStack spacing={4} align="start">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {/* Description */}
                          <HStack>
                            <Text fontWeight="bold">Description:</Text>
                            <Text>{row[4]}</Text>
                          </HStack>

                          {/* Size */}
                          <HStack>
                            <Text fontWeight="bold">Size:</Text>
                            <Text>{row[5]}</Text>
                          </HStack>

                          {/* Condition */}
                          <HStack>
                            <Text fontWeight="bold">Condition:</Text>
                            <Text>{row[6]}</Text>
                          </HStack>

                          {/* Gender */}
                          <HStack>
                            <Text fontWeight="bold">Gender:</Text>
                            <Text>{row[7]}</Text>
                          </HStack>

                          {/* Image */}
                          <Box>
                            <Image
                              src={row[8]}
                              boxSize="240px"
                              borderRadius="lg"
                              objectFit="cover"
                            />
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}