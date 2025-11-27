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

  // toggles the visibility of an expanded rowe
  const toggleIndex = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  const tableHeaders = [
    "Item Name",
    "Category",
    "Status",
    "Submitted At", // index 0-3
    "Description",
    "Size",
    "Condition",
    "Gender",
    "Image", // index 4-8 for expanded
  ];

  // may be worth finding a way to abstract this sorting logic for reuse as its present in adminLog.jsx as well
  // =======
  const [rowSortOptions, setRowSortOptions] = useState(
    tableHeaders.reduce(
      (o, v, i) => ({
        ...o,
        [v.replace(" ", "_")]: { order: "desc", index: i, current: false },
      }),
      {}
    )
  );

  /** @typedef {{order: ('asc' | 'desc'), index: number, current: boolean}} sortOptions*/

  const sortRows = (colName) => {
    /** @type {sortOptions} */
    const { index: colIndex, current, order } = rowSortOptions[colName];

    const newOrder = order === "asc" ? "desc" : "asc";

    const isAsc = newOrder === "asc";

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[colIndex];
      const bVal = b[colIndex];

      // Compare as number if both values are numbers
      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal)))
        return isAsc
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);

      // Fall back compare as strings
      return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    setRows(sorted);
    setRowSortOptions((previous) => {
      const newSet = {};

      // Reset the current property of each header
      for (const key in previous) {
        newSet[key] = {
          ...previous[key],
          current: false,
        };
      }

      // overide current header pressed with new current and order
      newSet[colName] = {
        ...newSet[colName],
        current: true,
        order: newOrder,
      };

      return newSet;
    });
  };
  // =======

  // Fetch donation history on load
  useEffect(() => {
    api
      .get(`/orgs/${organisation?.org_id}/donation-requests`)
      .then((res) =>
        setDonations(
          res.data.filter((don) => don.status.toLowerCase() !== "accepted")
        )
      )
      .catch((err) => console.error("Error fetching incoming donations:", err))
      .finally(() => setLoading(false));
  }, []);

  // Parse donations on data fetch and update data rows
  useEffect(() => {
    const parseDonations = () =>
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

    setDataRows(parseDonations());
  }, [donations]);

  // filter data rows on search value change or data row change
  useEffect(() => {
    const filterRows = () => {
      const normalisedSearch = searchValue.trim().toLowerCase();
      if (!normalisedSearch || normalisedSearch.length === 0)
        return setRows(dataRows);

      // filter by values of first 3 columns only to match table row layout
      const filtered = dataRows.filter((row) =>
        row
          .slice(0, 3)
          .some((cell) => String(cell).toLowerCase().includes(normalisedSearch))
      );

      console.log("Filtered Rows:", filtered);

      setRows(filtered);
    };

    filterRows();
  }, [searchValue, dataRows]);

  const updateDonationStatus = (searchKey, newStatus) => {
    console.log("Updating status to:", newStatus);
    console.log("With reason:", statusChangeReason);
    console.log("For item with key:", searchKey);
    try {
      if (!statusChangeReason || statusChangeReason.trim().length === 0) {
        toast.error("Please provide a reason for this status change.");
        return;
      }

      const [itemName, itemCatergory, itemStatusOld, itemSubmitted] =
        searchKey.split("+");
      const transaction_id = donations.find(
        (donation) =>
          donation.item_name === itemName &&
          donation.category === itemCatergory &&
          donation.status === itemStatusOld &&
          TimeFormatter.dateToFormat(donation.submitted_at) === itemSubmitted
      ).transaction_id;
      console.log("Found transaction ID:", transaction_id);
      console.log(
        "Donation matching search key:",
        donations.find((donation) => donation.transaction_id === transaction_id)
      );

      if (!transaction_id) {
        console.error("Donation not found for status update");
        return;
      }

      api
        .post(`/orgs/${transaction_id}/donation-request-update`, {
          status: newStatus,
          handled_by_staff_id: organisation.org_staff_id,
          reason: statusChangeReason,
        })
        .then((res) => {
          // Update local state to reflect status change
          setDonations((prevDonations) =>
            prevDonations.map((donation) =>
              donation.transaction_id === transaction_id
                ? { ...donation, status: newStatus }
                : donation
            )
          );
          toast.success("Donation status updated successfully.");
        })
        .catch((err) => {
          console.error("Error updating donation status:", err);
          toast.error("Failed to update donation status.");
        });
    } catch (err) {
      console.error("Error in updating donation status:", err);
      toast.error("An error occurred while updating the donation status.");
      return;
    }
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
            {searchValue.trim().length > 0
              ? "No results matching your search"
              : "No incoming donations found."}
          </Text>
        ) : (
          <Table variant={"simple"}>
            <Thead position={"sticky"} bg={"white"} top={0} zIndex={1}>
              <Tr>
                {tableHeaders.slice(0, 3).map((header, i) => (
                  <Th
                    key={i}
                    onClick={() => sortRows(header.replace(" ", "_"))}
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                  >
                    <Tooltip
                      label={`Sort by ${header}`}
                      placement="top"
                      hasArrow
                    >
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
                    key={`${i}-main`}
                    onClick={() => toggleIndex(i)}
                    cursor="pointer"
                    bg={expandedIndex === i ? "gray.200" : "white"}
                    _hover={{ bg: "gray.100" }}
                  >
                    {row.slice(0, 3).map((cell, j) => (
                      <Td
                        key={j}
                        position={expandedIndex === i ? "sticky" : "static"}
                        top={expandedIndex === i ? 30 : "auto"}
                        zIndex={expandedIndex === i ? 1 : "auto"}
                        bg={"inherit"}
                      >
                        {cell}
                      </Td>
                    ))}
                  </Tr>
                  {expandedIndex === i && (
                    <Tr key={`${i}-expanded`}>
                      <Td colSpan={3} key={`${i}-expanded-cell`}>
                        <VStack align="center" spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {row.slice(4).map((cell, k) =>
                              tableHeaders[k + 4].toLowerCase() === "image" ? ( // Handle images
                                <Box w={"full"} align="center" key={k}>
                                  <Image
                                    src={cell}
                                    alt={`${row[0]}`}
                                    boxSize="240px"
                                    objectFit="cover"
                                    borderRadius="xl"
                                    boxShadow="xl"
                                  />
                                </Box>
                              ) : (
                                // Default text handling
                                <HStack key={k} align="center" spacing={2}>
                                  <Text fontWeight="bold" minW={140}>
                                    {tableHeaders[k + 4]}:
                                  </Text>
                                  <Text>{cell}</Text>
                                </HStack>
                              )
                            )}
                            {/* Controls */}
                            {row[2] === "Pending" && (
                              <VStack spacing={2} align="center">
                                <Button
                                  onClick={() =>
                                    updateDonationStatus(
                                      row.slice(0, 4).join("+"),
                                      "Accepted"
                                    )
                                  }
                                  bg={"green.200"}
                                >
                                  Accept
                                </Button>
                                <Button
                                  onClick={() =>
                                    updateDonationStatus(
                                      row.slice(0, 4).join("+"),
                                      "Declined"
                                    )
                                  }
                                  bg={"red.200"}
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
                                  placeholder="Reason for decline/cancel"
                                  size="sm"
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
