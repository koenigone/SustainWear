import { Box, Button } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

/**
 * A multi-select dropdown component for use in forms or filters.
 *
 * @param {string[]} options - List of options to select from
 * @param {string[]} selectedOptions - Currently selected options
 * @param {function} onChange - Callback function when selected options change
 * @param {string} label - Label for the dropdown button
 * @returns {JSX.Element}
 */
const MultiSelect = ({
  options,
  selectedOptions,
  onChange,
  label,
  selectedColour = "gray.200",
  hoverColour = "gray.100",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleSelect = (value) => {
    const updated = selectedOptions.includes(value)
      ? selectedOptions.filter((v) => v !== value)
      : [...selectedOptions, value];

    onChange(updated);
  };

  useEffect(() => {
    const handleFocusLoss = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleFocusLoss);

    return () => {
      document.removeEventListener("mousedown", handleFocusLoss);
    };
  }, [ref]);

  return (
    <Box position={"relative"} width={"100%"} ref={ref}>
      <Button
        variant="outline"
        fontWeight="bold"
        mb={1}
        width={"100%"}
        cursor="pointer"
        onClick={() => setOpen(!open)}
        rightIcon={open ? <FaChevronUp /> : <FaChevronDown />}
      >
        {label}
      </Button>
      {open && (
        <Box
          borderWidth="1px"
          rounded="md"
          p={2}
          position={"absolute"}
          bg="white"
          zIndex={10}
          boxShadow="md"
          maxHeight="200px"
          overflowY="auto"
          width="100%"
        >
          {options.map((option) => (
            <Box
              key={option}
              p={1}
              cursor="pointer"
              bg={selectedOptions.includes(option) ? selectedColour : "white"}
              _hover={{ bg: hoverColour }}
              borderBottom="1px solid #eee"
              onClick={() => handleSelect(option)}
            >
              {option}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MultiSelect;
