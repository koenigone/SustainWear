import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  Heading,
  Center,
} from "@chakra-ui/react";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async () => { // submit register form
    try {
      const res = await api.post("/register", form);
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.errMessage || "Something went wrong");
    }
  };

  return (
    <Center minH="100vh" bg="brand.beige">
      <Box bg="brand.green" p={10} rounded="md" color="white" w="sm">
        <Heading size="lg" textAlign="center" mb={6}>
          Create Your Account
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="First Name"
            name="first_name"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Last Name"
            name="last_name"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Email"
            name="email"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Password"
            name="password"
            type="password"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Input
            placeholder="Confirm Password"
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            bg="white"
            color="black"
          />
          <Select
            placeholder="Select Role"
            name="role"
            onChange={handleChange}
            bg="white"
            color="black"
          >
            <option value="Donor">Donor</option>
            <option value="Staff">Charity Staff</option>
            <option value="Admin">Admin</option>
          </Select>
          <Button bg="white" color="brand.green" onClick={handleSubmit}>
            Register
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}