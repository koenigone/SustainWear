import { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Center,
} from "@chakra-ui/react";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");

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
              placeholder="email@gmail.com"
              name="email"
              onChange={handleChange}
              bg="white"
              color="black"
              _placeholder={{ color: "gray.400" }}
            />
            <Input
              placeholder="Password"
              name="password"
              type="password"
              onChange={handleChange}
              bg="white"
              color="black"
            />
            <Button type="submit" bg="white" color="brand.green">
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Center>
  );
}