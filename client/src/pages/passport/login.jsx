import { useState } from "react";
import {
  Box,
  Text,
  Link,
  Button,
  Flex,
  Input,
  VStack,
  Heading,
  Center,
  useDisclosure,
} from "@chakra-ui/react";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import PasswordResetModal from "../../components/modals/resetPasswordModal";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const passwordModal = useDisclosure();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", form);

      if (res.data.tempToken) {
        localStorage.setItem("tempToken", res.data.tempToken);
        navigate("/verifyTwoFactors");
        return;
      }

      toast.success("Login successful!");
      localStorage.setItem("token", res.data.token); // save token

      const user = res.data.user;
      setUser({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      });

      // redirect based on role
      if (user.role === "Donor") navigate("/donor");
      else if (user.role === "Staff") navigate("/staff");
      else if (user.role === "Admin") navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.errMessage || "Invalid credentials");
    }
  };

  return (
    <Center minH="100vh" bg="brand.beige">
      <Box bg="brand.green" p={10} rounded="md" color="white" w="sm">
        <Heading size="lg" textAlign="center" mb={6}>
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              placeholder="example@gmail.com"
              _placeholder={{ color: "gray.400" }}
              name="email"
              onChange={handleChange}
              bg="white"
              color="black"
            />
            <Input
              placeholder="Password"
              _placeholder={{ color: "gray.400" }}
              name="password"
              type="password"
              onChange={handleChange}
              bg="white"
              color="black"
            />
            <Button type="submit" bg="white" color="brand.green">
              Login
            </Button>

            <Flex
              direction="column"
              align="center"
              justify="center"
              w="100%"
              fontSize="sm"
              gap={2}
            >
              <Link
                opacity="80%"
                onClick={passwordModal.onOpen}
                textDecor="underline"
              >
                Forgot my password
              </Link>

              <Link
                opacity="80%"
                as={RouterLink}
                to="/register"
                textDecor="underline"
              >
                Create an Account
              </Link>
            </Flex>

            {/* RESET PASSWORD MODAL */}
            <PasswordResetModal
              isOpen={passwordModal.isOpen}
              onClose={passwordModal.onClose}
              email={form.email}
              isAuthenticated={false}
            />
          </VStack>
        </form>
      </Box>
    </Center>
  );
}