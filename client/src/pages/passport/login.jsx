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
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import PasswordResetModal from "../../components/modals/user/resetPasswordModal";
import { validateLogin } from "../../rules/validateLogin";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();
  const passwordModal = useDisclosure();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage(""); // clear inline message while typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FRONTEND VALIDATION
    const validation = validateLogin(form);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    try {
      const res = await api.post("/login", form);

      // 2FA CHECK
      if (res.data.tempToken) {
        localStorage.setItem("tempToken", res.data.tempToken);
        navigate("/verifyTwoFactors");
        return;
      }

      localStorage.setItem("token", res.data.token);

      const user = res.data.user;
      setUser({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      });

      // redirect by role
      if (user.role === "Donor") navigate("/donor");
      else if (user.role === "Staff") navigate("/staff");
      else if (user.role === "Admin") navigate("/admin");
    } catch (err) {
      const msg =
        err.response?.data?.errMessage ||
        err.response?.data?.message ||
        "Invalid credentials";

      setErrorMessage(msg);
    }
  };

  // disable button when fields empty
  const isFormInvalid = !form.email || !form.password;

  return (
    <Center minH="100vh" bg="brand.beige">
      <Box bg="brand.green" p={10} rounded="md" color="white" w="sm">
        <Heading size="lg" textAlign="center" mb={4}>
          Login
        </Heading>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <Text
            bg="red.100"
            color="red.700"
            p={2}
            mb={3}
            rounded="md"
            fontSize="sm"
            textAlign="center"
          >
            {errorMessage}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              placeholder="example@gmail.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              bg="white"
              color="black"
              _placeholder={{ color: "gray.400" }}
            />

            <Input
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              bg="white"
              color="black"
              _placeholder={{ color: "gray.400" }}
            />

            <Button
              type="submit"
              bg="white"
              color="brand.green"
              w="100%"
              isDisabled={isFormInvalid}
            >
              Login
            </Button>

            <Flex direction="column" align="center" fontSize="sm" gap={2}>
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