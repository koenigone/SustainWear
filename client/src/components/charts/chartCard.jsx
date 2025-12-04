import { Box, Heading, Spinner } from "@chakra-ui/react";

export default function ChartCard({ title, loading, children }) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <Heading size="md" mb={4} color="brand.green">
        {title}
      </Heading>

      {loading ? (
        <Box w="100%" py={10} display="flex" justifyContent="center">
          <Spinner size="xl" color="brand.green" />
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}