import { Center, VStack, Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../auth/authContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {   // auto redirect if already logged in
    if (user) {
      if (user.role === "Donor") navigate("/donor");
      else if (user.role === "Staff") navigate("/staff");
      else if (user.role === "Admin") navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <Center minH="100vh" bg="brand.beige">
      <VStack spacing={10}>
        <Box
          bg="brand.green"
          color="white"
          px={[10, 20]}
          py={[12, 16]}
          textAlign="center"
          rounded="md"
          w={["90%", "40rem"]}
          boxShadow="xl"
        >
          <Heading fontSize={["2xl", "3xl", "4xl"]} mb={4}>
            SustainWear Logo
          </Heading>
          <Text fontSize={["md", "lg"]} opacity={0.9}>
            "Smart Donation for Smart Sustainable Future"
          </Text>
        </Box>

        <VStack spacing={5}>
          <Button
            bg="brand.green"
            color="white"
            w={["10rem", "12rem"]}
            h="3rem"
            fontSize="lg"
            _hover={{ bg: "green.700" }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>

          <Button
            bg="brand.green"
            color="white"
            w={["10rem", "12rem"]}
            h="3rem"
            fontSize="lg"
            _hover={{ bg: "green.700" }}
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </VStack>
      </VStack>
    </Center>
  );
}