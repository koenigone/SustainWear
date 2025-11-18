import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import theme from "./theme.js";
import { AuthProvider } from "./auth/authContext.jsx";
import { NotificationProvider } from "./components/notificationsContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <App />
            <Toaster
              position="top-right"
              containerStyle={{ zIndex: 9999 }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#2F855A",
                  color: "#fff",
                  borderRadius: "8px",
                },
                success: {
                  iconTheme: {
                    primary: "#38A169",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#E53E3E",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>
);