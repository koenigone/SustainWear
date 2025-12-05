import { Text, VStack, HStack, Badge, Flex } from "@chakra-ui/react";
import ChartCard from "../chartCard";

export default function DonorLeaderboard({
  leaderboard = [],
  rank,
  currentUser,
}) {
  const RANK_COLORS = {
    0: { bg: "#FFF6C2", border: "#F2D675" }, // Gold
    1: { bg: "#F2F2F2", border: "#D6D6D6" }, // Silver
    2: { bg: "#FFE8C2", border: "#E4B778" }, // Bronze
  };

  return (
    <ChartCard title="Top Donors">
      <Flex direction="column" flex="1">
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
          {leaderboard.length === 0 && (
            <Text color="gray.500" textAlign="center">
              No donors yet.
            </Text>
          )}

          {leaderboard.map((entry, i) => {
            const isYou = entry.user_id === currentUser.user_id;

            const rankStyle = RANK_COLORS[i] || null;

            const bgColor = isYou
              ? rankStyle?.bg || "green.50"
              : rankStyle?.bg || "white";

            const borderColor = isYou
              ? rankStyle?.border || "green.300"
              : rankStyle?.border || "gray.200";

            return (
              <HStack
                key={entry.user_id}
                justify="space-between"
                align="center"
                px={3}
                py={isYou ? 4 : 3}
                borderRadius="md"
                border="2px solid"
                borderColor={isYou ? borderColor : borderColor}
                bg={bgColor}
                transition="all 0.2s ease"
              >
                <Text
                  fontWeight={isYou ? "700" : "500"}
                  fontSize={isYou ? "md" : "sm"}
                >
                  {i + 1}. {isYou ? "You" : entry.name}
                </Text>

                <Badge colorScheme="green">
                  {entry.accepted_count} accepted
                </Badge>
              </HStack>
            );
          })}
        </VStack>

        <Text mt={3} fontSize="sm" color="gray.600">
          Your Rank: <b>{rank}</b>
        </Text>
      </Flex>
    </ChartCard>
  );
}