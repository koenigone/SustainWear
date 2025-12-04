import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  Center,
  Text,
  HStack,
  Input,
} from "@chakra-ui/react";
import api from "../api/axiosClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

// 6 digit input component with paste support
function CodeInput({ code, setCode }) {
  const inputs = Array.from({ length: 6 }, () => useRef(null));

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newCode = code.split("");
      newCode[index] = value;
      setCode(newCode.join(""));
      if (value && index < 5) inputs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").trim();
    if (!/^\d{1,6}$/.test(pasted)) return;

    const digits = pasted.slice(0, 6).split("");
    const newCode = Array(6).fill("");
    digits.forEach((digit, i) => (newCode[i] = digit));

    setCode(newCode.join(""));

    const lastIndex = digits.length - 1;
    if (inputs[lastIndex]) inputs[lastIndex].current.focus();
  };

  return (
    <HStack justify="center" spacing={3}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Input
          key={i}
          ref={inputs[i]}
          maxLength={1}
          textAlign="center"
          fontSize="2xl"
          w="3.5rem"
          h="4rem"
          bg="white"
          color="black"
          border="2px solid"
          borderColor="brand.green"
          borderRadius="md"
          _focus={{ borderColor: "brand.green", outline: "none" }}
          value={code[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </HStack>
  );
}

export default function Verify2FA() {
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // countdown for resend button
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // verify entered code
  const handleSubmit = async () => {
    const tempToken = localStorage.getItem("tempToken");
    if (!tempToken) return toast.error("Session expired. Please log in again.");

    try {
      const res = await api.post("/verifyTwoFactors", { tempToken, code });

      toast.success("2FA Verified!");
      localStorage.removeItem("tempToken");
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      const role = res.data.user.role;
      if (role === "Donor") navigate("/donor");
      else if (role === "Staff") navigate("/staff");
      else navigate("/admin");
    } catch (err) {
      toast.error(
        err.response?.data?.errMessage?.code ||
          err.response?.data?.errMessage ||
          "Invalid code"
      );
    }
  };

  // resend code
  const handleResend = async () => {
    const tempToken = localStorage.getItem("tempToken");
    if (!tempToken) return toast.error("Session expired. Please log in again.");

    try {
      await api.post("/resendTwoFactors", { tempToken });
      toast.success("A new code has been sent to your email.");
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.errMessage || "Unable to resend code.");
    }
  };

  return (
    <Center minH="100vh" bg="brand.beige">
      <Box
        bg="brand.green"
        p={12}
        rounded="lg"
        color="white"
        w={["90%", "28rem"]}
        boxShadow="xl"
      >
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center">
            Verify 2FA Code
          </Heading>

          <Text fontSize="md" textAlign="center" opacity={0.9}>
            A 6-digit code was sent to your email.
          </Text>

          <CodeInput code={code} setCode={setCode} />

          <Button
            bg="white"
            color="brand.green"
            fontWeight="bold"
            w="40%"
            _hover={{ bg: "brand.beige", color: "brand.green" }}
            onClick={handleSubmit}
            isDisabled={code.length !== 6}
          >
            Verify
          </Button>

          <Button
            variant="link"
            color="white"
            fontSize="sm"
            onClick={handleResend}
            isDisabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend code"}
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
