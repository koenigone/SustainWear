import {
  Box,
  Flex,
  Text,
  Avatar,
  Spacer,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAuth } from "../auth/authContext";
import LogoutBtn from "./logoutBtn";

export default function Header() {
  const { user, isLoading } = useAuth();

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isLoading) {
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

  if (!user) {
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
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1000"
    >
      {/* LEFT SIDE Avatar + Name */}
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

      {/* DESKTOP VIEW - normal layout */}
      {!isMobile && (
        <>
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
        </>
      )}

      {/* MOBILE VIEW - dropdown menu */}
      {isMobile && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<BsThreeDotsVertical />}
            variant="ghost"
            color="green.600"
            fontSize="22px"
          />

          <MenuList>
            <MenuItem isDisabled fontWeight="bold">
              {user.role === "Staff" && user.organisation
                ? `Staff for ${user.organisation.name}`
                : user.role}
            </MenuItem>

            <LogoutBtn asMenuItem />
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
}