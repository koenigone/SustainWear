import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";

export default function StaffActivityHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/staff/activity")
      .then((res) => setLogs(res.data))
      .catch(() => {
        toast.error("Unable to load activity history");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        Organisation Activity History
      </Heading>

      {logs.length === 0 ? (
        <Text color="gray.500" textAlign="center">
          No activity records found.
        </Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Action</Th>
              <Th>Description</Th>
              <Th>Performed By</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map((log) => (
              <Tr key={log.log_id}>
                <Td>{log.action}</Td>
                <Td>{log.details}</Td>
                <Td>{log.performed_by}</Td>
                <Td>{new Date(log.created_at).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
