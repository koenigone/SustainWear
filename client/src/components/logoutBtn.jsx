import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import toast from "react-hot-toast";
import api from "../api/axiosClient";

export default function LogoutBtn() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout request failed (continuing):", err.message);
    }

    logout(); // clears token and user context
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <Button
      ml={4}
      colorScheme="red"
      size="sm"
      variant="solid"
      _hover={{ bg: "red.500" }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}