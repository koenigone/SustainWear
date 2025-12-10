import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Flex,
  Button,
  Select,
  Input,
  Spinner,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
  Heading,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import { TimeFormatter } from "../../../helpers/timeFormatter";

const parseMetadata = (meta) => {
  if (!meta) return null;
  if (typeof meta === "object") return meta;
  try {
    return JSON.parse(meta);
  } catch {
    return null;
  }
};

const buildActionDescription = (log) => {
  const metadata = parseMetadata(log.metadata);
  const user = log.target_user_name !== "—" ? log.target_user_name : null;
  const org = log.target_org_name !== "—" ? log.target_org_name : null;

  // admin actions
  switch (log.action_type) {
    case "USER_ACTIVATED":
      return user ? `Activated user ${user}` : "Activated a user";
    case "USER_DEACTIVATED":
      return user ? `Deactivated user ${user}` : "Deactivated a user";
    case "USER_ROLE_CHANGED":
      return `Changed ${user}'s role from ${metadata?.old_role} to ${metadata?.new_role}`;
    case "ORG_CREATED":
      return `Created organisation ${org || metadata?.org_name}`;
    case "ORG_UPDATED":
      return `Updated organisation ${org || metadata?.org_name}`;
    case "ORG_ACTIVATED":
      return `Activated organisation ${org}`;
    case "ORG_DEACTIVATED":
      return `Deactivated organisation ${org}`;
    case "MEMBER_ADDED":
      return user && org ? `Added ${user} to ${org}` : "Added staff member";
    case "MEMBER_REMOVED":
      return user && org
        ? `Removed ${user} from ${org}`
        : "Removed staff member";
    case "REPORT_GENERATED":
      return `Generated ${metadata?.report_type || "report"}`;
    default:
      return `${log.action_category}: ${log.action_type}`;
  }
};

export default function AdminLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [adminFilter, setAdminFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [visibleCount, setVisibleCount] = useState(40);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    api
      .get("/admin/logs")
      .then((res) => setLogs(res.data || []))
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.action_category && set.add(l.action_category));
    return [...set];
  }, [logs]);

  const actionTypes = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.action_type && set.add(l.action_type));
    return [...set];
  }, [logs]);

  const admins = useMemo(() => {
    const map = new Map();
    logs.forEach((l) => map.set(l.admin_email, l.admin_name || l.admin_email));
    return [...map.entries()].map(([email, name]) => ({ email, name }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== "ALL" && log.action_category !== categoryFilter)
        return false;
      if (typeFilter !== "ALL" && log.action_type !== typeFilter) return false;
      if (adminFilter !== "ALL" && log.admin_email !== adminFilter)
        return false;

      const date = new Date(log.timestamp);

      if (fromDate && date < new Date(fromDate)) return false;

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (date > to) return false;
      }

      return true;
    });
  }, [logs, categoryFilter, typeFilter, adminFilter, fromDate, toDate]);

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const visibleLogs = sortedLogs.slice(0, visibleCount);

  const clearFilters = () => {
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setAdminFilter("ALL");
    setFromDate("");
    setToDate("");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="250px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={2} bg="white">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        px={1}
        gap={3}
        flexWrap="wrap"
      >
        <Button
          bg="brand.green"
          color="white"
          _hover={{ bg: "brand.greenDark" }}
          onClick={onOpen}
          size="sm"
        >
          Filter
        </Button>

        <Text
          fontSize="sm"
          color="gray.600"
          fontWeight="500"
          whiteSpace="nowrap"
        >
          Showing {visibleLogs.length} of {sortedLogs.length} entries
        </Text>
      </Flex>

      {/* FILTER DRAWER */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
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
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={5} align="stretch">
              {/* Category */}
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Category
                </Text>
                <Select
                  size="sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All categories</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Box>

              {/* Action Type */}
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Action Type
                </Text>
                <Select
                  size="sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All types</option>
                  {actionTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Box>

              {/* Admin */}
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Admin
                </Text>
                <Select
                  size="sm"
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                >
                  <option value="ALL">All admins</option>
                  {admins.map((a) => (
                    <option key={a.email} value={a.email}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Date From */}
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Date From
                </Text>
                <Input
                  size="sm"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Box>

              {/* Date To */}
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Date To
                </Text>
                <Input
                  size="sm"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* MOBILE MODE */}
      {isMobile ? (
        <Box>
          {visibleLogs.length === 0 ? (
            <Text textAlign="center" py={6} color="gray.500">
              No logs found.
            </Text>
          ) : (
            visibleLogs.map((log) => {
              const desc = buildActionDescription(log);
              const targetName =
                log.target_user_name !== "—"
                  ? log.target_user_name
                  : log.target_org_name;

              const targetEmail =
                log.target_user_email !== "—"
                  ? log.target_user_email
                  : log.target_org_email;

              return (
                <Box
                  key={log.log_id}
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  mb={3}
                  bg="gray.50"
                >
                  <Text fontWeight="semibold" mb={1}>
                    {desc}
                  </Text>

                  <Text fontSize="xs" color="gray.600">
                    {TimeFormatter.dateToFormat(log.timestamp)}
                  </Text>

                  <Box mt={3}>
                    <Text fontSize="xs" color="gray.500">
                      Admin:
                    </Text>
                    <Text fontSize="sm">{log.admin_name}</Text>
                  </Box>

                  <Box mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Target:
                    </Text>
                    <Text fontSize="sm">{targetName}</Text>
                  </Box>

                  <Box mt={1}>
                    <Text fontSize="xs" color="gray.500">
                      Email:
                    </Text>
                    <Text fontSize="sm">{targetEmail}</Text>
                  </Box>
                </Box>
              );
            })
          )}

          {sortedLogs.length > visibleCount && (
            <Flex justify="center" mt={4}>
              <Button size="sm" onClick={() => setVisibleCount((v) => v + 40)}>
                Load More
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        // DESKTOP TABLE
        <Box overflowX="auto">
          <Table size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>Timestamp</Th>
                <Th>Admin</Th>
                <Th>Action</Th>
                <Th>Category</Th>
                <Th>Target</Th>
                <Th>Target Email</Th>
              </Tr>
            </Thead>
            <Tbody>
              {visibleLogs.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={6}>
                    <Text color="gray.500">No logs match your filters.</Text>
                  </Td>
                </Tr>
              ) : (
                visibleLogs.map((log) => {
                  const desc = buildActionDescription(log);
                  const targetName =
                    log.target_user_name !== "—"
                      ? log.target_user_name
                      : log.target_org_name;

                  const targetEmail =
                    log.target_user_email !== "—"
                      ? log.target_user_email
                      : log.target_org_email;

                  return (
                    <Tr key={log.log_id}>
                      <Td>{TimeFormatter.dateToFormat(log.timestamp)}</Td>
                      <Td>
                        <Text fontWeight="medium">{log.admin_name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {log.admin_email}
                        </Text>
                      </Td>
                      <Td>{desc}</Td>
                      <Td>
                        <Badge>{log.action_category}</Badge>
                        <Text fontSize="xs">{log.action_type}</Text>
                      </Td>
                      <Td>{targetName}</Td>
                      <Td>{targetEmail}</Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>

          {sortedLogs.length > visibleCount && (
            <Flex justify="center" mt={4}>
              <Button size="sm" onClick={() => setVisibleCount((v) => v + 40)}>
                Load More
              </Button>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}