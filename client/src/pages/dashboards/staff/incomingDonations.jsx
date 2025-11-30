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
  Tooltip,
  Heading,
  Image,
  SimpleGrid,
  Input,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { TimeFormatter } from "../../../helpers/timeFormatter";
import { useAuth } from "../../../auth/authContext";
import toast from "react-hot-toast";

const DonationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const { organisation } = useAuth();

  // Toggle expanded view
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

  // Sorting logic
  const [rowSortOptions, setRowSortOptions] = useState(
    tableHeaders.reduce(
      (o, v, i) => ({
        ...o,
        [v.replace(" ", "_")]: { order: "desc", index: i, current: false },
      }),
      {}
    )
  );

  const sortRows = (colName) => {
    const { index: colIndex, order } = rowSortOptions[colName];
    const newOrder = order === "asc" ? "desc" : "asc";
    const isAsc = newOrder === "asc";

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[colIndex];
      const bVal = b[colIndex];

      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal)))
        return isAsc
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);

      return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    setRows(sorted);
    setRowSortOptions((old) => {
      const updated = {};
      for (const key in old) {
        updated[key] = { ...old[key], current: false };
      }
      updated[colName] = { ...updated[colName], current: true, order: newOrder };
      return updated;
    });
  };

  // Fetch donations
  useEffect(() => {
    api
      .get(`/org/${organisation?.org_id}/donation-requests`)
      .then((res) =>
        setDonations(
          res.data.filter((don) => don.status.toLowerCase() !== "accepted")
        )
      )
      .catch((err) => console.error("Error fetching incoming donations:", err))
      .finally(() => setLoading(false));
  }, []);

  // Convert DB data → table rows
  useEffect(() => {
    const parse = () =>
      donations.map((donation) => [
        donation.item_name,
        donation.category,
        donation.status,
        TimeFormatter.dateToFormat(donation.submitted_at),
        donation.description,
        donation.size,
        donation.item_condition,
        donation.gender,
        donation.photo_url,
      ]);

    setDataRows(parse());
  }, [donations]);

  // Search filtering
  useEffect(() => {
    const normalised = searchValue.trim().toLowerCase();
    if (!normalised) return setRows(dataRows);

    const filtered = dataRows.filter((row) =>
      row
        .slice(0, 3)
        .some((cell) => String(cell).toLowerCase().includes(normalised))
    );

    setRows(filtered);
  }, [searchValue, dataRows]);

  // Update donation status
  const updateDonationStatus = (searchKey, newStatus) => {
    if (!statusChangeReason.trim()) {
      toast.error("Please provide a reason for this status change.");
      return;
    }

    const [itemName, itemCategory, itemStatusOld, itemSubmitted] =
      searchKey.split("+");

    const donation = donations.find(
      (d) =>
        d.item_name === itemName &&
        d.category === itemCategory &&
        d.status === itemStatusOld &&
        TimeFormatter.dateToFormat(d.submitted_at) === itemSubmitted
    );

    if (!donation) {
      toast.error("Donation not found.");
      return;
    }

    const transaction_id = donation.transaction_id;

    api
      .post(`/org/${transaction_id}/donation-request-update`, {
        status: newStatus,
        handled_by_staff_id: organisation.org_staff_id,
        reason: statusChangeReason,
      })
      .then(() => {
        setDonations((prev) =>
          prev.map((d) =>
            d.transaction_id === transaction_id
              ? { ...d, status: newStatus }
              : d
          )
        );
        toast.success("Donation status updated successfully.");
      })
      .catch((err) => {
        console.error("Error updating donation status:", err);
        toast.error("Failed to update donation status.");
      });
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <Heading size="md" mb={4}>
        Incoming Donations For {organisation?.org_name}
      </Heading>

      <VStack>
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          w={"full"}
        />

        {rows.length === 0 ? (
          <Text>
            {searchValue.trim().length
              ? "No results matching your search"
              : "No incoming donations found."}
          </Text>
        ) : (
          <Table variant={"simple"}>
            <Thead bg={"white"} position={"sticky"} top={0} zIndex={1}>
              <Tr>
                {tableHeaders.slice(0, 3).map((header, i) => (
                  <Th
                    key={i}
                    cursor="pointer"
                    onClick={() => sortRows(header.replace(" ", "_"))}
                    _hover={{ textDecoration: "underline" }}
                  >
                    <Tooltip label={`Sort by ${header}`} hasArrow>
                      {header}
                    </Tooltip>
                  </Th>
                ))}
              </Tr>
            </Thead>

            <Tbody>
              {rows.map((row, i) => (
                <React.Fragment key={i}>
                  <Tr
                    onClick={() => toggleIndex(i)}
                    cursor="pointer"
                    bg={expandedIndex === i ? "gray.200" : "white"}
                    _hover={{ bg: "gray.100" }}
                  >
                    {row.slice(0, 3).map((cell, j) => (
                      <Td key={j}>{cell}</Td>
                    ))}
                  </Tr>

                  {expandedIndex === i && (
                    <Tr>
                      <Td colSpan={3}>
                        <VStack spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {row.slice(4).map((cell, k) =>
                              tableHeaders[k + 4].toLowerCase() === "image" ? (
                                <Box key={k} w="full" textAlign="center">
                                  <Image
                                    src={cell}
                                    alt={row[0]}
                                    boxSize="240px"
                                    borderRadius="xl"
                                    boxShadow="xl"
                                    objectFit="cover"
                                  />
                                </Box>
                              ) : (
                                <HStack key={k}>
                                  <Text fontWeight="bold" minW={140}>
                                    {tableHeaders[k + 4]}:
                                  </Text>
                                  <Text>{cell}</Text>
                                </HStack>
                              )
                            )}

                            {row[2] === "Pending" && (
                              <VStack spacing={2} align="center">
                                <Button
                                  bg="green.200"
                                  onClick={() =>
                                    updateDonationStatus(
                                      row.slice(0, 4).join("+"),
                                      "Accepted"
                                    )
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  bg="red.200"
                                  onClick={() =>
                                    updateDonationStatus(
                                      row.slice(0, 4).join("+"),
                                      "Declined"
                                    )
                                  }
                                >
                                  Decline
                                </Button>

                                <Button
                                  onClick={() =>
                                    updateDonationStatus(
                                      row.slice(0, 4).join("+"),
                                      "Cancelled"
                                    )
                                  }
                                >
                                  Cancel
                                </Button>

                                <Input
                                  size="sm"
                                  placeholder="Reason for decline/cancel"
                                  onChange={(e) =>
                                    setStatusChangeReason(e.target.value)
                                  }
                                />
                              </VStack>
                            )}
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
      </VStack>
    </Box>
  );
};

export default DonationHistory;
