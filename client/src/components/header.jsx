import { Box, Flex, Text, Avatar, Spacer, Badge } from "@chakra-ui/react";
import { useAuth } from "../auth/authContext";
import LogoutBtn from "./logoutBtn";

export default function Header() {
  const { user, isLoading, organisation } = useAuth();

  if (isLoading) { // still loading user info
    return (
      <Box
        bg="teal.600"
        color="white"
        p={4}
        textAlign="center"
        fontWeight="bold"
      >
        Loading user info...
      </Box>
    );
  }

  if (!user) { // in case no user logged in and header is shown
    return (
      <Box
        bg="teal.600"
        color="white"
        p={4}
        textAlign="center"
        fontWeight="bold"
      >
        No user logged in
      </Box>
    );
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      color="green"
      px={6}
      py={3}
      boxShadow="base"
    >
      <Flex align="center" gap={3}>
        <Avatar bg="teal.300" color="black" />
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            {user.first_name}
          </Text>
          <Text fontSize="sm" opacity="60%">
            {user.email}
          </Text>
        </Box>
      </Flex>

      <Spacer />

      <Badge
        fontSize="0.9em"
        px={3}
        py={1}
        borderRadius="md"
        colorScheme="green"
      >
        {user.role === "Staff" && user.organisation
          ? `Staff for ${user.organisation.name}`
          : user.role}
      </Badge>

      <LogoutBtn />
    </Flex>
  );
}