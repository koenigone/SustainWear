import { useState } from "react";
import {
  Box,
  Text,
  Link,
  Button,
  Input,
  VStack,
  Heading,
  Center,
} from "@chakra-ui/react";
import api from "../../api/axiosClient";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { validateRegisterForm } from "../../rules/validateRegister";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMessage(""); // clear error when user types
  };

  // FRONTEND VALIDATION (INLINE ERRORS)
  const validateForm = () => {
    const result = validateRegisterForm(form);

    if (!result.valid) {
      setErrorMessage(result.message);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  // SUBMIT REGISTER FORM
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const res = await api.post("/register", form);
      navigate("/login");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.errMessage ||
          "Something went wrong"
      );
    }
  };

  // disable button if any field is empty
  const isFormInvalid =
    !form.first_name ||
    !form.last_name ||
    !form.email ||
    !form.password ||
    !form.confirmPassword;

  return (
    <Center minH="100vh" as="main" bg="brand.beige">
      <Box bg="brand.green" p={10} rounded="md" color="white" w="sm">
        <Heading size="lg" textAlign="center" mb={4}>
          Create Your Account
        </Heading>

        {/* INLINE ERROR MESSAGE */}
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

        <VStack spacing={4}>
          <Input
            placeholder="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            bg="white"
            color="black"
            _placeholder={{ color: "gray.400" }}
          />

          <Input
            placeholder="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            bg="white"
            color="black"
            _placeholder={{ color: "gray.400" }}
          />

          <Input
            placeholder="Email"
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

          <Input
            placeholder="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            bg="white"
            color="black"
            _placeholder={{ color: "gray.400" }}
          />

          <Button
            bg="white"
            color="brand.green"
            onClick={handleSubmit}
            isDisabled={isFormInvalid}
            width="100%"
          >
            Register
          </Button>

          <Box>
            <Text>
              Already a user?{" "}
              <Link as={RouterLink} to="/login" textDecor="underline">
                Login
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
}