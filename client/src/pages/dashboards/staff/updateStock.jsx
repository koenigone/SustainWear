import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Image,
  Text,
  Button,
  useDisclosure,
  VStack,
  HStack,
  Badge,
  Input,
  Select,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";

import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";
import toast from "react-hot-toast";
import InventoryItemModal from "../../../components/modals/staff/donationReviewModal";

export default function UpdateStock() {
  const { organisation } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [beneficiary, setBeneficiary] = useState("");
  const [distributing, setDistributing] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterGender, setFilterGender] = useState("");

  // mobile breakpoint
  const isMobile = useBreakpointValue({ base: true, md: false });

  // fetch inventory
  const fetchInventory = async () => {
    try {
      if (!organisation?.org_id) return;

      const res = await api.get(`/orgs/${organisation.org_id}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to load inventory", err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [organisation]);

  const handlePreview = (item) => {
    setSelectedItem(item);
    setBeneficiary("");
    onOpen();
  };

  const handleDistribute = async () => {
    if (!beneficiary.trim()) {
      return toast.error("Please enter a beneficiary group.");
    }

    setDistributing(true);

    try {
      await api.post(
        `/orgs/${organisation.org_id}/distribute/${selectedItem.inv_id}`,
        { beneficiary_group: beneficiary }
      );

      setInventory((prev) =>
        prev.filter((item) => item.inv_id !== selectedItem.inv_id)
      );

      toast.success("Item distributed successfully!");
      onClose();
      setSelectedItem(null);
    } catch (err) {
      console.error("Distribution failed:", err);
      toast.error("Failed to distribute item.");
    } finally {
      setDistributing(false);
    }
  };

  // filtering Logic
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.item_name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !filterCategory || item.category === filterCategory;

      const matchesSize = !filterSize || item.size === filterSize;

      const matchesGender =
        !filterGender ||
        item.gender === filterGender ||
        (filterGender === "Unspecified" && !item.gender);

      return matchesSearch && matchesCategory && matchesSize && matchesGender;
    });
  }, [inventory, search, filterCategory, filterSize, filterGender]);

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("");
    setFilterSize("");
    setFilterGender("");
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.green" />
        <Text mt={4} color="gray.600">
          Loading inventory…
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* FILTER BAR */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        mb={4}
        gap={3}
        flexWrap="wrap"
      >
        <Input
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          width={{ base: "100%", md: "30%" }}
        />

        <HStack spacing={3} flexWrap="wrap">
          <Select
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            width="150px"
          >
            <option value="Hoodie">Hoodie</option>
            <option value="Jacket">Jacket</option>
            <option value="T-Shirt">T-Shirt</option>
          </Select>

          <Select
            placeholder="Size"
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            width="120px"
          >
            {["XXS", "XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>

          <Select
            placeholder="Gender"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            width="150px"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>

          <Button size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>
      </Flex>

      {/* INVENTORY TABLE OR MOBILE CARDS */}
      {filteredInventory.length === 0 ? (
        <Box bg="white" p={8} borderRadius="xl" shadow="md" textAlign="center">
          <Text fontSize="lg" color="gray.600">
            No items match your filter.
          </Text>
        </Box>
      ) : (
        <>
          {!isMobile ? (
            // DESKTOP TABLE
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              shadow="md"
              overflowX="auto"
            >
              <Table variant="simple">
                <Thead bg="brand.beige">
                  <Tr>
                    <Th>Photo</Th>
                    <Th>Item</Th>
                    <Th>Category</Th>
                    <Th>Size</Th>
                    <Th>Condition</Th>
                    <Th>Gender</Th>
                    <Th>Added At</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {filteredInventory.map((item) => (
                    <Tr key={item.inv_id}>
                      <Td>
                        <Image
                          src={item.photo_urls?.[0]}
                          boxSize="60px"
                          borderRadius="md"
                          objectFit="cover"
                        />
                      </Td>

                      <Td fontWeight="600">{item.item_name}</Td>

                      <Td>
                        <Badge colorScheme="green">{item.category}</Badge>
                      </Td>

                      <Td>{item.size}</Td>
                      <Td>{item.item_condition}</Td>
                      <Td>{item.gender || "Unspecified"}</Td>

                      <Td color="gray.600">
                        {new Date(item.added_at).toLocaleDateString()}
                      </Td>

                      <Td>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handlePreview(item)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            // MOBILE CARDS
            <VStack spacing={4} align="stretch">
              {filteredInventory.map((item) => (
                <Box
                  key={item.inv_id}
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Image
                    src={item.photo_urls?.[0]}
                    borderRadius="md"
                    width="100%"
                    maxH="200px"
                    objectFit="cover"
                    mb={3}
                  />

                  <Heading size="md">{item.item_name}</Heading>

                  <HStack mt={2} spacing={2}>
                    <Badge colorScheme="green">{item.category}</Badge>
                    <Badge colorScheme="blue">Size: {item.size}</Badge>
                  </HStack>

                  <Text mt={1}>Condition: {item.item_condition}</Text>
                  <Text>Gender: {item.gender || "Unspecified"}</Text>

                  <Text color="gray.600" mt={1}>
                    Added: {new Date(item.added_at).toLocaleDateString()}
                  </Text>

                  <Button
                    colorScheme="green"
                    size="sm"
                    w="100%"
                    mt={3}
                    onClick={() => handlePreview(item)}
                  >
                    View
                  </Button>
                </Box>
              ))}
            </VStack>
          )}
        </>
      )}

      {/* ITEM PREVIEW MODAL*/}
      {selectedItem && (
        <InventoryItemModal
          isOpen={isOpen}
          onClose={onClose}
          item={selectedItem}
          beneficiary={beneficiary}
          setBeneficiary={setBeneficiary}
          distributing={distributing}
          handleDistribute={handleDistribute}
        />
      )}
    </Box>
  );
}