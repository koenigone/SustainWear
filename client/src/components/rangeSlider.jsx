import {
  Box,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

/**
 * A customizable range slider component for use in filters/forms.
 *
 * @param {string} title - Title of the range slider
 * @param {number} min - Minimum value of the slider
 * @param {number} max - Maximum value of the slider
 * @param {number} step - Step value for the slider
 * @param {number[]} values - Current values of the slider
 * @param {function} onChange - Callback function when values change
 * @param {function} onChangeEnd - Callback function when value change ends
 * @param {string} sliderColourBackground - Background colour of the slider track
 * @param {string} sliderColourBar - Colour of the filled portion of the slider track
 * @returns {JSX.Element}
 */
const RangeSliderComponent = ({
  min,
  max,
  step,
  title,
  values,
  onChange,
  onChangeEnd,
  sliderColourBar = "brand.green",
  sliderColourBackground = "gray.200",
}) => {
  const [internalValues, setInternalValues] = useState(values || [min, max]);

  useEffect(() => {
    setInternalValues(values || [min, max]);
  }, [values, min, max]);

  return (
    <Box>
      <VStack align="start" mb={2} w="100%">
        {title && (
          <Box fontWeight="bold" paddingBottom="10px">
            {title}
          </Box>
        )}
        <RangeSlider
          min={min}
          max={max}
          step={step}
          value={internalValues}
          onChange={(values) => {
            setInternalValues(values);

            if (onChange && typeof onChange === "function") {
              onChange(values);
            }
          }}
          onChangeEnd={onChangeEnd}
        >
          <RangeSliderTrack bg={sliderColourBackground}>
            <RangeSliderFilledTrack bg={sliderColourBar} />
          </RangeSliderTrack>
          {internalValues.map((val, index) => (
            <RangeSliderThumb index={index} key={index}>
              <Box
                position="absolute"
                top="-24px"
                fontSize="xs"
                fontWeight="bold"
                color="gray.700"
              >
                {val}
              </Box>
            </RangeSliderThumb>
          ))}
        </RangeSlider>
      </VStack>
    </Box>
  );
};

export default RangeSliderComponent;
