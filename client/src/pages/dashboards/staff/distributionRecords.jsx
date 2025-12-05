import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Heading,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  HStack,
  Flex,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import { useAuth } from "../../../auth/authContext";
import { TimeFormatter } from "../../../helpers/timeFormatter";
import MultiSelect from "../../../components/multiSelect";
import RangeSliderComponent from "../../../components/rangeSlider";
import ExportData from "../../../components/exportData";

const DistributionRecords = () => {
  const { organisation } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [dropwdownValues, setDropdownValues] = useState({
    staff_members: [],
    item_categories: [],
    beneficiary_groups: [],
  });
  const [sliders, setSliders] = useState([
    {
      label: "Beneficiary Count",
      key: "beneficiaryCount",
      absoluteMin: 0,
      absoluteMax: 0,
    },
    {
      label: "Quantity Distributed",
      key: "quantityDistributed",
      absoluteMin: 0,
      absoluteMax: 0,
    },
    { label: "CO2 Saved", key: "co2Saved", absoluteMin: 0, absoluteMax: 0 },
    {
      label: "Landfill Saved",
      key: "landfillSaved",
      absoluteMin: 0,
      absoluteMax: 0,
    },
  ]);
  const [filters, setFilters] = useState({
    staff_members: [],
    item_categories: [],
    beneficiary_groups: [],
    beneficiaryCount: { min: null, max: null },
    dateRange: { from: null, to: null },
    quantityDistributed: { min: null, max: null },
    co2Saved: { min: null, max: null },
    landfillSaved: { min: null, max: null },
  });

  const headers = [
    "Item Name",
    "Category",
    "Size",
    "Condition",
    "Quantity Distributed",
    "Recipient",
    "CO2 Saved (kg)",
    "Landfill Saved (kg)",
    "Number of Beneficiaries",
    "Time of Distribution",
    "Staff Member",
  ];

  // load distribution records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!organisation?.org_id) return;

        const res = await api.get(
          `/orgs/${organisation.org_id}/distribution-records`
        );

        setRecords(res.data);
      } catch (err) {
        console.error("Failed to load distribution records", err);
        toast.error("Failed to load distribution records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // get filter option values
  useEffect(() => {
    const getFilterOptions = () => {
      const staffMembers = new Set();
      const itemCategories = new Set();
      const beneficiaryGroups = new Set();

      records.forEach((record) => {
        if (!staffMembers.has(record.staff_name))
          staffMembers.add(record.staff_name);
        if (!itemCategories.has(record.category))
          itemCategories.add(record.category);
        if (!beneficiaryGroups.has(record.beneficiary_group))
          beneficiaryGroups.add(record.beneficiary_group);

        setSliders((prevSliders) =>
          prevSliders.map((slider) => {
            let newMin = slider.absoluteMin;
            let newMax = slider.absoluteMax;
            const recordValue =
              record[
                slider.key === "beneficiaryCount"
                  ? "beneficiaries"
                  : slider.key === "quantityDistributed"
                  ? "quantity_distributed"
                  : slider.key === "co2Saved"
                  ? "co2_saved"
                  : slider.key === "landfillSaved"
                  ? "landfill_saved"
                  : null
              ];
            if (recordValue < newMin) newMin = recordValue;
            if (recordValue > newMax) newMax = recordValue;
            return {
              ...slider,
              absoluteMin: newMin,
              absoluteMax: newMax,
            };
          })
        );
      });

      setDropdownValues({
        staff_members: Array.from(staffMembers),
        item_categories: Array.from(itemCategories),
        beneficiary_groups: Array.from(beneficiaryGroups),
      });
    };

    getFilterOptions();
  }, [records]);

  // filter records
  useEffect(() => {
    const filter = () => {
      const filtered = records.filter((record) => {
        const {
          staff_members,
          item_categories,
          beneficiary_groups,
          beneficiaryCount,
          dateRange,
          quantityDistributed,
          co2Saved,
          landfillSaved,
        } = filters;

        if (
          staff_members.length > 0 &&
          !staff_members.includes(record.staff_name)
        )
          return false;

        if (
          item_categories.length > 0 &&
          !item_categories.includes(record.category)
        )
          return false;

        if (
          beneficiary_groups.length > 0 &&
          !beneficiary_groups.includes(record.beneficiary_group)
        )
          return false;

        if (
          beneficiaryCount.min !== null &&
          record.beneficiaries < beneficiaryCount.min
        )
          return false;

        if (
          beneficiaryCount.max !== null &&
          record.beneficiaries > beneficiaryCount.max
        )
          return false;

        const recordDate = new Date(record.distributed_at);
        if (dateRange.from && recordDate < new Date(dateRange.from))
          return false;

        if (dateRange.to && recordDate > new Date(dateRange.to)) return false;

        if (
          quantityDistributed.min !== null &&
          record.quantity_distributed < quantityDistributed.min
        )
          return false;

        if (
          quantityDistributed.max !== null &&
          record.quantity_distributed > quantityDistributed.max
        )
          return false;

        if (co2Saved.min !== null && record.co2_saved < co2Saved.min)
          return false;

        if (co2Saved.max !== null && record.co2_saved > co2Saved.max)
          return false;

        if (
          landfillSaved.min !== null &&
          record.landfill_saved < landfillSaved.min
        )
          return false;

        if (
          landfillSaved.max !== null &&
          record.landfill_saved > landfillSaved.max
        )
          return false;

        return true;
      });

      setFilteredRecords(filtered);
    };

    filter();
  }, [filters, records]);

  if (loading) return <Spinner />;

  return (
    <Box>
      <VStack>
        {/* Controls */}
        <HStack spacing={4} alignSelf="flex-start">
          <Button
            variant={"solid"}
            bgColor="brand.green"
            color="white"
            _hover={{ bgColor: "brand.greenDark", textDecoration: "underline" }}
            onClick={onOpen}
            mb={4}
            alignSelf="flex-start"
          >
            Filter
          </Button>
          <ExportData
            json={filteredRecords}
            filename={`distribution_records_${TimeFormatter.dateToFormat(
              new Date(),
              "dd_mm_yyyy"
            )}`}
          />
        </HStack>
        {/* Filters */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>
              <Flex w="100%" align="center" gap={4}>
                <Heading size={"lg"}>Filters</Heading>
                <Button
                  variant={"outline"}
                  color={"brand.red"}
                  size="sm"
                  ml={"5px"}
                  mr={"25px"}
                  flex="1"
                  maxWidth="calc(100% - 50px)"
                  alignSelf="flex-end"
                  onClick={() => {
                    setFilters({
                      staff_members: [],
                      item_categories: [],
                      beneficiary_groups: [],
                      beneficiaryCount: { min: null, max: null },
                      dateRange: { from: null, to: null },
                      quantityDistributed: { min: null, max: null },
                      co2Saved: { min: null, max: null },
                      landfillSaved: { min: null, max: null },
                    });
                  }}
                >
                  Clear All Filters
                </Button>
                <DrawerCloseButton />
              </Flex>
            </DrawerHeader>
            <DrawerBody>
              <Box>
                <VStack spacing={3} mb={5}>
                  <Heading size="md">Filters</Heading>
                  <Grid templateColumns="1fr" gap={4} w="100%">
                    {/* Dropdown Filters */}
                    {Object.entries(dropwdownValues).map(([key, values], i) => (
                      <MultiSelect
                        key={i}
                        options={values}
                        selectedOptions={filters[key]}
                        onChange={(values) => {
                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            [key]: values,
                          }));
                        }}
                        label={key
                          .split("_")
                          .map(
                            (w) =>
                              `${w.substring(0, 1).toUpperCase()}${w.slice(1)}`
                          )
                          .join(" ")}
                        width={"100%"}
                      />
                    ))}
                    {/* Date Range Filters */}
                    {["from", "to"].map((bound, i) => (
                      <Box key={i}>
                        <Heading size="sm" mb={1}>
                          Date{" "}
                          {`${bound.substring(0, 1).toUpperCase()}${bound.slice(
                            1
                          )}`}
                        </Heading>
                        <Input
                          type="date"
                          value={filters.dateRange[bound] || ""}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                [bound]: e.target.value || null,
                              },
                            }))
                          }
                        />
                      </Box>
                    ))}
                    {/* Slider filters (min/max) */}
                    {sliders.map(
                      ({ label, key, absoluteMin, absoluteMax }, i) => (
                        <Box key={i}>
                          <RangeSliderComponent
                            title={label}
                            min={absoluteMin}
                            max={absoluteMax}
                            step={(absoluteMax - absoluteMin) / 100}
                            onChangeEnd={(value) => {
                              setFilters((prev) => ({
                                ...prev,
                                [key]: {
                                  min: value[0],
                                  max: value[1],
                                },
                              }));
                            }}
                          />
                        </Box>
                      )
                    )}
                  </Grid>
                </VStack>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        {/* Table */}
        {records.length === 0 ? (
          <Box>No distribution records found.</Box>
        ) : filteredRecords.length === 0 ? (
          <Box>No Results</Box>
        ) : (
          <TableContainer overflowX={"auto"}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  {headers.map((header, hI) => (
                    <Th key={hI}>{header}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record, rI) => (
                  <Tr key={rI}>
                    <Td>{record.item_name}</Td>
                    <Td>{record.category}</Td>
                    <Td>{record.size}</Td>
                    <Td>{record.item_condition}</Td>
                    <Td>{record.quantity_distributed}</Td>
                    <Td>{record.beneficiary_group}</Td>
                    <Td>{record.co2_saved}</Td>
                    <Td>{record.landfill_saved}</Td>
                    <Td>{record.beneficiaries}</Td>
                    <Td>{TimeFormatter.dateToFormat(record.distributed_at)}</Td>
                    <Td>{record.staff_name}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>
    </Box>
  );
};

export default DistributionRecords;
