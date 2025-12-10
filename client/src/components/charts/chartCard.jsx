import { Box, Heading, Spinner } from "@chakra-ui/react";

export default function ChartCard({ title, loading, children }) {
  return (
    <Box
      p={5}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      height="100%"
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="320px"
    >
      <Heading size="md" mb={4} color="brand.green">
        {title}
      </Heading>

      {loading ? (
        <Box w="100%" py={10} display="flex" justifyContent="center">
          <Spinner size="xl" color="brand.green" />
        </Box>
      ) : (
        <Box flex="1" overflow="hidden">
          {children}
        </Box>
      )}
    </Box>
  );
}