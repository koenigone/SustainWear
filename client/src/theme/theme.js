import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      green: "#2E7D32",
      beige: "#ffffffff",
      grey: "#4E4E4E",
      darkGrey: "#212121",
      red: "#D32F2F",
      navbar: "#27672A",
    },
  },
  styles: {
    global: {
      body: {
        bg: "brand.beige",
        color: "brand.darkGrey",
      },
      button: {
        _hover: { filter: "brightness(90%)" },
      },
    },
  },
});

export default theme;