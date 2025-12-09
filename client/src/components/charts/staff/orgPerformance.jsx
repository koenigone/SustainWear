import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import ChartCard from "../chartCard";

export default function OrgPerformanceMetrics({ metrics = {} }) {
  return (
    <ChartCard title="Performance Metrics">
      <VStack align="stretch" spacing={4}>
        <Metric label="Accepted Donations" value={metrics.total_accepted} />
        <Metric label="Declined Donations" value={metrics.total_declined} />

        <Metric
          label="Acceptance Ratio"
          value={metrics.acceptance_ratio || "0:0"}
        />

        <Metric
          label="Average Handling Time (hrs)"
          value={metrics.avg_handling_hours ?? "N/A"}
        />

        {metrics.most_active_staff ? (
          <Box>
            <Text fontSize="sm" color="gray.500">
              Most Active Staff
            </Text>
            <HStack justify="space-between" p={2}>
              <Text fontWeight="600">
                {metrics.most_active_staff.staff_name}
              </Text>
              <Badge colorScheme="green">
                {metrics.most_active_staff.handled_count} handled
              </Badge>
            </HStack>
          </Box>
        ) : (
          <Text fontSize="sm" color="gray.400" mt={2}>
            No staff activity yet.
          </Text>
        )}
      </VStack>
    </ChartCard>
  );
}

function Metric({ label, value }) {
  return (
    <HStack justify="space-between">
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontSize="lg" fontWeight="700" color="brand.green">
        {value}
      </Text>
    </HStack>
  );
}