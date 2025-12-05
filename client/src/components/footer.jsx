import { Flex, Text, Box } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={8}
      py={3}
      borderTop="1px solid"
      borderColor="gray.200"
      bg="brand.beige"
      flexShrink={0}
    >
      <Text fontSize="sm" color="gray.600">
        © {new Date().getFullYear()} SustainWear Platform
      </Text>

      <Flex align="center" gap={2}>
        {/* dots */}
        <Flex align="center" gap={1.5}>
          <Box w="10px" h="10px" borderRadius="full" bg="brand.green" />
          <Box w="10px" h="10px" borderRadius="full" bg="#FFD52E" />
          <Box w="10px" h="10px" borderRadius="full" bg="#4CAFFF" />
        </Flex>

        <Text fontSize="sm" color="gray.600">
          Built by Group 9, Sheffield Hallam University
        </Text>
      </Flex>
    </Flex>
  );
}