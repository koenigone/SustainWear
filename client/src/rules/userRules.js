export const USER_RULES = {
  FIRST_NAME: {
    REQUIRED: "First name is required.",
    LENGTH: "First name must be between 2 and 25 characters.",
  },
  LAST_NAME: {
    REQUIRED: "Last name is required.",
    LENGTH: "Last name must be between 2 and 25 characters.",
  },
  EMAIL: {
    REQUIRED: "Email is required.",
    INVALID: "Please enter a valid email address.",
  },
  PASSWORD: {
    REQUIRED: "Password is required.",
    LENGTH: "Password must be at least 8 characters long.",
  },
  CONFIRM_PASSWORD: {
    MATCH: "Passwords do not match.",
  },
};