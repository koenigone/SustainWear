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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { TimeFormatter } from "../../../helpers/timeFormatter";

const DonationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchValue, setSearchValue] = useState("");

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
      .get("/donor/donations/history")
      .then((res) => setDonations(res.data))
      .catch((err) => console.error("Failed to load donation history", err))
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

      setRows(filtered);
    };

    filterRows();
  }, [searchValue, dataRows]);

  if (loading) return <Spinner />;

  return (
    <Box>
      <Heading size="md" mb={4}>
        Donation History
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
              : "No donation history found."}
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
                              tableHeaders[k + 4].toLowerCase() !== "image" ? (
                                <HStack key={k} align="center" spacing={2}>
                                  <Text fontWeight="bold" minW={140}>
                                    {tableHeaders[k + 4]}:
                                  </Text>
                                  <Text>{cell}</Text>
                                </HStack>
                              ) : (
                                <Box key={k}>
                                  <Image
                                    src={cell}
                                    alt={`${row[0]}`}
                                    boxSize="240px"
                                    objectFit="cover"
                                    borderRadius="xl"
                                    boxShadow="xl"
                                  />
                                </Box>
                              )
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
