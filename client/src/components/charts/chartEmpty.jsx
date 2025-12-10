import { Box, Text, Icon } from "@chakra-ui/react";
import { FiBarChart2 } from "react-icons/fi";

// used when there is no data to show in a chart
export default function ChartEmpty({ message = "No data available yet." }) {
  return (
    <Box
      textAlign="center"
      py={10}
      color="gray.500"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      minH="220px"
    >
      <Icon as={FiBarChart2} boxSize={12} mb={3} color="gray.400" />
      <Text fontSize="md">{message}</Text>
    </Box>
  );
}