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
  Tooltip,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import toast from "react-hot-toast";
import { TimeFormatter } from "../../../helpers/timeFormatter";

export default function AdminLog() {
  const [logs, setLogs] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Moved table headers out of return into their own array so more can be added easily
  const tableHeaders = ["Admin", "Action", "Target", "Target Email", "Date"];
  // Creates an object from the headers.
  // Key as header(white space replaced with '_')
  // Value as an object with Keys 'order' as 'desc' or 'asc', 'index' as number, 'current' boolean
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

  // Fetch data
  useEffect(() => {
    api
      .get("/admin/logs")
      .then((res) => setLogs(res.data))
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  // Parse data into rows
  // Moved this logic out of the return statement
  useEffect(() => {
    const parseLogs = () =>
      logs.map((log) => {
        // determine which target (user or org) to display
        const targetName =
          log.target_user_name !== "—"
            ? log.target_user_name
            : log.target_org_name;
        const targetEmail =
          log.target_user_email !== "—"
            ? log.target_user_email
            : log.target_org_email;

        return [
          log.admin_name,
          log.action,
          targetName || "—",
          targetEmail || "—",
          TimeFormatter.dateToFormat(log.timestamp), // Using Time helper instead of toLocaleString
        ];
      });

    setRows(parseLogs());
  }, [logs]);

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

  if (loading) return <Spinner size="xl" />; // chakraUI's loading spinner

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        Admin Activity Log
      </Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            {tableHeaders.map((header, headerI) => (
              <Th
                key={headerI}
                onClick={() => sortRows(header.replace(" ", "_"))}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                {header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.length === 0 ? (
            <Tr>
              <Td colSpan={5} textAlign="center">
                No audit logs found
              </Td>
            </Tr>
          ) : (
            rows.map((row, rowI) => (
              <Tr key={rowI}>
                {row.map((cell, cellI) => (
                  <Td key={cellI}>{cell}</Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
