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
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";

export default function AdminLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/logs")
      .then((res) => setLogs(res.data))
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="xl" />; // chakraUI's loading spinner

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        Admin Activity Log
      </Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Admin</Th>
            <Th>Action</Th>
            <Th>Target</Th>
            <Th>Target Email</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.length === 0 ? (
            <Tr>
              <Td colSpan={5} textAlign="center">
                No audit logs found
              </Td>
            </Tr>
          ) : (
            logs.map((log) => { // determine which target (user or org) to display
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
                  <Td>{log.admin_name}</Td>
                  <Td>{log.action}</Td>
                  <Td>{targetName || "—"}</Td>
                  <Td>{targetEmail || "—"}</Td>
                  <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );
}