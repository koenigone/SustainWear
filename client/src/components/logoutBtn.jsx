import { Button, MenuItem } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import toast from "react-hot-toast";
import api from "../api/axiosClient";
import ConfirmLogout from "./modals/user/confirmLogoutModal";

export default function LogoutBtn({ asMenuItem = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout request failed (continuing):", err.message);
    }

    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // render as a menu item for mobile dropdown
  if (asMenuItem) {
    return (
      <MenuItem onClick={handleLogout} color="red.500" fontWeight="bold">
        Logout
      </MenuItem>
    );
  }

  // normal desktop button
  return (
    <ConfirmLogout
      title="Logout"
      message="Are you sure you want to log out?"
      confirmText="Logout"
      closeText="Return"
    >
      <Button
        ml={4}
        colorScheme="gray"
        size="sm"
        variant="solid"
        _hover={{ bg: "red.500" }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </ConfirmLogout>
  );
}