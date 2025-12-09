import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { IoSparkles } from "react-icons/io5";
import { useState, useEffect } from "react";
import api from "../../../api/axiosClient";
import MultiImageUpload from "../../../components/multiImageUpload";

export default function DonateItem() {
  const toast = useToast();

  const [form, setForm] = useState({
    org_id: "",
    item_name: "",
    description: "",
    category: "",
    item_condition: "",
    size: "",
    gender: "",
  });
  const [images, setImages] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // fetch organisations on load
  useEffect(() => {
    api
      .get("/orgs/active")
      .then((res) => setOrganisations(res.data))
      .catch(() =>
        toast({
          status: "error",
          title: "Failed to load organisations",
        })
      );
  }, []);

  const handleGenerateDescription = async () => {
    if (!form.item_name || !form.category || !form.item_condition) {
      toast({
        status: "error",
        title: "Missing information",
        description: "Please enter name, category and condition first.",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const res = await api.post("/donor/generate-description", {
        item_name: form.item_name,
        category: form.category,
        item_condition: form.item_condition,
        size: form.size,
        gender: form.gender,
      });

      setForm((prev) => ({
        ...prev,
        description: res.data.description,
      }));

      toast({ status: "success", title: "Description generated!" });
    } catch (err) {
      toast({
        status: "error",
        title: "AI Error",
        description:
          err.response?.data?.errMessage || "Failed to generate description",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // hnadle form submission
  const handleSubmit = async () => {
    // Require at least 1 image
    if (images.length === 0) {
      return toast({
        status: "error",
        title: "Images Required",
        description: "Please upload at least 1 image.",
      });
    }

    // Validate text fields
    for (const key in form) {
      if (!form[key]) {
        return toast({
          status: "error",
          title: "Missing Fields",
          description: "Fill out all fields before submitting.",
        });
      }
    }

    const formData = new FormData();

    // append form fields
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // append images
    images.forEach((img) => {
      formData.append("photos", img.file);
    });

    try {
      setIsSubmitting(true);

      await api.post("/donor/donations/request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        status: "success",
        title: "Donation Submitted",
        description: "Your donation request has been sent.",
      });

      // reset form after submit
      setForm({
        org_id: "",
        item_name: "",
        description: "",
        category: "",
        item_condition: "",
        size: "",
        gender: "",
      });
      setImages([]);
      MultiImageUpload.clear(); // clear image input
    } catch (err) {
      toast({
        status: "error",
        title: "Failed",
        description: err.response?.data?.errMessage || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      boxShadow="md"
      maxW="120vh"
      mx="auto"
      mt={6}
    >
      <VStack spacing={4} align="stretch">
        {/* Organisation */}
        <FormControl>
          <FormLabel>Donate To</FormLabel>
          <Select
            name="org_id"
            value={form.org_id || ""}
            onChange={handleChange}
            placeholder="Select organisation"
            variant="outline"
            focusBorderColor="green.600"
            bg="white"
            color="black"
            borderColor="brand.green"
            sx={{
              "> option": {
                background: "white",
                color: "black",
              },
              "& .chakra-select__field": {
                background: "white !important",
                color: "black !important",
                borderColor: "brand.green !important",
              },
            }}
          >
            {organisations.map((org) => (
              <option key={org.org_id} value={org.org_id}>
                {org.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Name */}
        <FormControl>
          <FormLabel>Item Name</FormLabel>
          <Input
            name="item_name"
            value={form.item_name}
            onChange={handleChange}
            placeholder="e.g. Blue Winter Coat"
            _placeholder={{ color: "gray.400" }}
            bg="white"
            borderColor="brand.green"
            borderWidth="1.5px"
            _hover={{ borderColor: "brand.green" }}
            _focus={{
              borderColor: "brand.green",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
              bg: "white",
            }}
          />
        </FormControl>

        {/* Description */}
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the item condition, brand, notes..."
            _placeholder={{ color: "gray.400" }}
            bg="white"
            borderColor="brand.green"
            borderWidth="1.5px"
            _hover={{ borderColor: "brand.green" }}
            _focus={{
              borderColor: "brand.green",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-green)",
              bg: "white",
            }}
          />

          <Button
            mt={2}
            size="sm"
            bg="purple.600"
            color="white"
            _hover={{ bg: "purple.700" }}
            _active={{ bg: "purple.800" }}
            _focus={{ boxShadow: "0 0 0 2px rgba(128, 90, 213, 0.6)" }}
            onClick={handleGenerateDescription}
            isLoading={isGenerating}
            loadingText="Generating..."
            leftIcon={<IoSparkles size={16} />}
            gap={2}
          >
            Generate with AI
          </Button>
        </FormControl>

        {/* Category */}
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select
            name="category"
            placeholder="Select category"
            value={form.category}
            onChange={handleChange}
            variant="outline"
            focusBorderColor="green.600"
            bg="white"
            color="black"
            borderColor="brand.green"
            sx={{
              "> option": {
                background: "white",
                color: "black",
              },
              "& .chakra-select__field": {
                background: "white !important",
                color: "black !important",
                borderColor: "brand.green !important",
              },
            }}
          >
            <option value="T-Shirt">T-Shirt</option>
            <option value="Jacket">Jacket</option>
            <option value="Hoodie">Hoodie</option>
            <option value="Trousers">Trousers</option>
            <option value="Shoes">Shoes</option>
            <option value="Dress">Dress</option>
          </Select>
        </FormControl>

        {/* Condition */}
        <FormControl>
          <FormLabel>Condition</FormLabel>
          <Select
            name="item_condition"
            value={form.item_condition}
            onChange={handleChange}
            placeholder="Select condition"
            variant="outline"
            focusBorderColor="green.600"
            bg="white"
            color="black"
            borderColor="brand.green"
            sx={{
              "> option": {
                background: "white",
                color: "black",
              },
              "& .chakra-select__field": {
                background: "white !important",
                color: "black !important",
                borderColor: "brand.green !important",
              },
            }}
          >
            <option>Brand New</option>
            <option>Like New</option>
            <option>Gently Used</option>
            <option>Used / Good Condition</option>
            <option>Needs Repair</option>
          </Select>
        </FormControl>

        {/* Size */}
        <FormControl>
          <FormLabel>Size</FormLabel>
          <Select
            name="size"
            placeholder="Select size"
            value={form.size}
            onChange={handleChange}
            variant="outline"
            focusBorderColor="green.600"
            bg="white"
            color="black"
            borderColor="brand.green"
            sx={{
              "> option": {
                background: "white",
                color: "black",
              },
              "& .chakra-select__field": {
                background: "white !important",
                color: "black !important",
                borderColor: "brand.green !important",
              },
            }}
          >
            {["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map(
              (s) => (
                <option key={s}>{s}</option>
              )
            )}
          </Select>
        </FormControl>

        {/* Gender */}
        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            placeholder="Select gender"
            variant="outline"
            focusBorderColor="green.600"
            bg="white"
            color="black"
            borderColor="brand.green"
            sx={{
              "> option": {
                background: "white",
                color: "black",
              },
              "& .chakra-select__field": {
                background: "white !important",
                color: "black !important",
                borderColor: "brand.green !important",
              },
            }}
          >
            <option>Male</option>
            <option>Female</option>
          </Select>
        </FormControl>

        {/* Upload Images */}
        <FormControl mb={4}>
          <FormLabel>Upload Images</FormLabel>

          <MultiImageUpload
            images={images}
            setImages={setImages}
            max={4}
            toast={toast}
          />
        </FormControl>

        <Button
          bg="green.600"
          color="white"
          _hover={{ bg: "green.700" }}
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          Submit Donation
        </Button>
      </VStack>
    </Box>
  );
}