import { Flex, Text, Box } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify={{ base: "center", md: "space-between" }}
      align={{ base: "center", md: "center" }}
      px={{ base: 4, md: 8 }}
      py={3}
      gap={{ base: 2, md: 0 }}
      borderTop="1px solid"
      borderColor="gray.200"
      bg="brand.beige"
      flexShrink={0}
      textAlign={{ base: "center", md: "left" }}
    >
      <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.600">
        © {new Date().getFullYear()} SustainWear Platform
      </Text>

      <Flex align="center" gap={2} direction={{ base: "column", sm: "row" }}>
        {/* dots */}
        <Flex align="center" gap={1.5}>
          <Box w="8px" h="8px" borderRadius="full" bg="brand.green" />
          <Box w="8px" h="8px" borderRadius="full" bg="#FFD52E" />
          <Box w="8px" h="8px" borderRadius="full" bg="#4CAFFF" />
        </Flex>

        <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.600">
          Built by Group 9, Sheffield Hallam University
        </Text>
      </Flex>
    </Flex>
  );
}