import { Box, Flex, Heading } from "@chakra-ui/react";
import Header from "./components/header";

export default function Layout({ title, children }) {
  return (
    <Flex direction="column" h="100vh" bg="brand.beige" overflow="hidden">
      {/* fixed header */}
      <Header />

      {/* main content area (non-scrollable wrapper) */}
      <Flex direction="column" flex="1" overflow="hidden" p={8} pt="90px">
        <Heading
          size={{ base: "md", md: "lg" }}
          color="brand.green"
          mb={{ base: 4, md: 6 }}
          flexShrink={0}
        >
          {title}
        </Heading>

        {/* dashboard container */}
        <Flex flex="1" overflow="hidden">
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}