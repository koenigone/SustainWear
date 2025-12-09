import { Flex, Heading } from "@chakra-ui/react";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Layout({ title, children }) {
  return (
    <Flex direction="column" h="100vh" bg="brand.beige">
      <Header />

      {/* MAIN AREA */}
      <Flex direction="column" flex="1" overflow="hidden" pt="90px">
        <Heading
          size={{ base: "md", md: "lg" }}
          color="brand.green"
          mb={{ base: 4, md: 6 }}
          px={8}
          flexShrink={0}
        >
          {title}
        </Heading>

        {/* Children decides what's scrollable */}
        <Flex direction="column" flex="1" overflow="hidden">
          {children}
        </Flex>

        <Footer />
      </Flex>
    </Flex>
  );
}