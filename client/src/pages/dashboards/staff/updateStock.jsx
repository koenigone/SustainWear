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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";
import toast from "react-hot-toast";

export default function UpdateStock() {
  const { organisation } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [beneficiary, setBeneficiary] = useState("");
  const [distributing, setDistributing] = useState(false);

  // load inventory items
  const fetchInventory = async () => {
    try {
      if (!organisation?.org_id) return;

      const res = await api.get(`/orgs/${organisation.org_id}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to load inventory", err);
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

  // handle Distribution Logic
  const handleDistribute = async () => {
    if (!beneficiary.trim()) {
      return toast.error("Please enter a beneficiary group.");
    }

    setDistributing(true);

    try {
      await api.post(
        `/orgs/${organisation.org_id}/distribute/${selectedItem.inv_id}`,
        {
          beneficiary_group: beneficiary,
        }
      );

      // remove item from inventory list when distributed
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
      <Heading size="lg" color="brand.green" mb={6}>
        Inventory Stock
      </Heading>

      {inventory.length === 0 ? (
        <Box bg="white" p={8} borderRadius="xl" shadow="md" textAlign="center">
          <Text fontSize="lg" color="gray.600">
            No items in inventory yet.
          </Text>
        </Box>
      ) : (
        <Box bg="white" p={6} borderRadius="xl" shadow="md" overflowX="auto">
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
              {inventory.map((item) => (
                <Tr key={item.inv_id}>
                  <Td>
                    <Image
                      src={item.photo_url}
                      boxSize="60px"
                      borderRadius="md"
                      objectFit="cover"
                    />
                  </Td>

                  <Td fontWeight="600">{item.item_name}</Td>

                  <Td>
                    <Badge
                      colorScheme="green"
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {item.category}
                    </Badge>
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
      )}

      {/* ITEM REVIEW */}
      {selectedItem && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="brand.green">
              {selectedItem.item_name}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6}>
              <VStack spacing={4} align="start">
                <Image
                  src={selectedItem.photo_url}
                  borderRadius="lg"
                  width="100%"
                  maxH="300px"
                  objectFit="cover"
                />

                <HStack spacing={4}>
                  <Badge colorScheme="green">{selectedItem.category}</Badge>
                  <Badge colorScheme="blue">Size: {selectedItem.size}</Badge>
                </HStack>

                <Text>
                  <strong>Condition:</strong> {selectedItem.item_condition}
                </Text>

                <Text>
                  <strong>Gender:</strong>{" "}
                  {selectedItem.gender || "Unspecified"}
                </Text>

                <Text>
                  <strong>Description:</strong> {selectedItem.description}
                </Text>

                <Text color="gray.600">
                  <strong>Added At:</strong>{" "}
                  {new Date(selectedItem.added_at).toLocaleString()}
                </Text>

                {/* DISTRIBUTION FORM*/}
                <Box
                  w="100%"
                  mt={4}
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid #e2e8f0"
                >
                  <Heading size="sm" mb={3} color="brand.green">
                    Distribute Item
                  </Heading>

                  <Input
                    placeholder="Beneficiary group (e.g., Local Shelter)"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    mb={3}
                  />

                  <Button
                    width="100%"
                    colorScheme="green"
                    isLoading={distributing}
                    onClick={handleDistribute}
                  >
                    Confirm Distribution
                  </Button>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}