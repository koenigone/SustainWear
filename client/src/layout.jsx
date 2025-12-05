import { Flex, Heading, Box } from "@chakra-ui/react";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Layout({ title, children }) {
  return (
    <Flex direction="column" h="100vh" bg="brand.beige">
      {/* FIXED HEADER */}
      <Header />

      {/* MAIN AREA */}
      <Flex direction="column" flex="1" overflow="hidden" pt="90px">
        {/* PAGE TITLE */}
        <Heading
          size={{ base: "md", md: "lg" }}
          color="brand.green"
          mb={{ base: 4, md: 6 }}
          px={8}
          flexShrink={0}
        >
          {title}
        </Heading>

        {/* CONTENT WRAPPER (scrolls internally, not the whole page) */}
        <Box flex="1" overflow="hidden" px={8}>
          <Box h="100%" overflowY="auto">
            {children}
          </Box>
        </Box>

        {/* FIXED FOOTER */}
        <Footer />
      </Flex>
    </Flex>
  );
}