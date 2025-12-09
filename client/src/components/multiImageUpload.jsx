import { useRef } from "react";
import { Box, Image, Input, IconButton, Flex, Text, Button } from "@chakra-ui/react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";

export default function MultiImageUpload({
  images,
  setImages,
  max = 4, // max 4 photos
  toast,
}) {
  const fileRef = useRef(null);

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > max) {
      toast({
        status: "error",
        title: "Too many images",
        description: `You can upload up to ${max} images.`,
      });
      return;
    }

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (index) => {
    const updated = [...images];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setImages(updated);
  };

  // clear input from parent
  const clearInput = () => {
    if (fileRef.current) fileRef.current.value = "";
  };

  // expose clearInput to parent
  MultiImageUpload.clear = clearInput;

  return (
    <Box>
      <Box>
        {/* HIDDEN REAL INPUT */}
        <Input
          type="file"
          accept="image/*"
          multiple
          ref={fileRef}
          onChange={handleSelect}
          display="none"
        />

        {/* CUSTOM UPLOAD BUTTON */}
        <Button
          onClick={() => fileRef.current?.click()}
          bg="green.600"
          color="white"
          _hover={{ bg: "green.700" }}
          leftIcon={<IoCloudUploadOutline />}
          mb={3}
        >
          Upload Images
        </Button>
      </Box>

      <Text fontSize="sm" color="gray.600" mb={2}>
        {images.length}/{max} uploaded
      </Text>

      <Flex wrap="wrap" gap={4}>
        {images.map((img, i) => (
          <Box
            key={i}
            position="relative"
            boxSize={{ base: "100px", md: "120px" }}
            borderRadius="md"
            overflow="hidden"
            border="1px solid #ddd"
            _hover={{ boxShadow: "md" }}
          >
            <Image
              src={img.preview}
              alt=""
              objectFit="cover"
              w="100%"
              h="100%"
            />

            <IconButton
              icon={<IoClose size={14} />}
              size="xs"
              aria-label="Remove image"
              position="absolute"
              top="4px"
              right="4px"
              bg="white"
              _hover={{ bg: "red.200" }}
              borderRadius="full"
              onClick={() => removeImage(i)}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}