import { Text, VStack, HStack, Badge } from "@chakra-ui/react";
import ChartCard from "../chartCard";

export default function RecentActivity({ data }) {
  const getColor = (action) => {
    switch (action) {
      case "Accepted":
        return "green";
      case "Declined":
        return "red";
      case "Pending":
        return "yellow";
      case "Distributed":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <ChartCard title="Recent Activity">
      <VStack
        spacing={3}
        align="stretch"
        flex="1"
        overflowY="auto"
        pr={1}
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e0",
            borderRadius: "8px",
          },
        }}
      >
        {(!data || data.length === 0) && (
          <Text color="gray.700" textAlign="center">
            No recent activity yet.
          </Text>
        )}

        {data?.map((entry, index) => (
          <HStack
            key={index}
            p={3}
            bg="gray.50"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.100"
            justify="space-between"
            alignItems="flex-start"
          >
            {/* LEFT SIDE */}
            <VStack align="start" spacing={1}>
              <Text fontWeight="600" noOfLines={1}>
                {entry.item_name}
              </Text>

              <Text fontSize="xs" color="gray.700">
                {new Date(entry.timestamp).toLocaleString()}
              </Text>

              {entry.action_type === "Distributed" && (
                <Text fontSize="sm">
                  Distributed to: <b>{entry.beneficiary_group}</b>
                </Text>
              )}

              {entry.action_type === "Declined" && (
                <Text fontSize="sm" color="red.700">
                  Reason: {entry.details}
                </Text>
              )}
            </VStack>

            {/* RIGHT SIDE */}
            <Badge colorScheme={getColor(entry.action_type)}>
              {entry.action_type}
            </Badge>
          </HStack>
        ))}
      </VStack>
    </ChartCard>
  );
}