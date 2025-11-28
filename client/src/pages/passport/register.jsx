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
import toast from "react-hot-toast";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // validate front end form
  const validateForm = () => {
    const { first_name, last_name, email, password, confirmPassword } = form;

    if (!first_name.trim() || !last_name.trim()) {
      toast.error("First and last name are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => { // submit register form

    if (!validateForm()) return; // stop if validation fails

    try {
      const res = await api.post("/register", form);
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("error 1", err);
      console.error("error 2", err.response);
      toast.error(err.response?.data?.errMessage || "Something went wrong");
    }
  };

  // disable submit button if any field is empty
  const isFormInvalid =
    !form.first_name ||
    !form.last_name ||
    !form.email ||
    !form.password ||
    !form.confirmPassword;

  return (
    <Center minH="100vh" bg="brand.beige">
      <Box bg="brand.green" p={10} rounded="md" color="white" w="sm">
        <Heading size="lg" textAlign="center" mb={6}>
          Create Your Account
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="First Name"
            _placeholder={{ color: "gray.400" }}
            name="first_name"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Last Name"
            _placeholder={{ color: "gray.400" }}
            name="last_name"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Email"
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
          <Input
            placeholder="Confirm Password"
            _placeholder={{ color: "gray.400" }}
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Button
            bg="white"
            color="brand.green"
            onClick={handleSubmit}
            isDisabled={isFormInvalid}
          >
            Register
          </Button>

          <Box>
            <Text opacity="80%">Already a user? <Link as={RouterLink} to="/login" textDecor="underline">Login</Link></Text>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
}