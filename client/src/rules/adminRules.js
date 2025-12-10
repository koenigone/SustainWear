export const ADMIN_RULES = {
  NAME: {
    REQUIRED: "Organisation name is required.",
    LENGTH: "Organisation name must be between 2 and 50 characters.",
  },
  DESCRIPTION: {
    REQUIRED: "Description is required.",
    LENGTH: "Description must be between 5 and 200 characters.",
  },
  STREET: {
    REQUIRED: "Street name is required.",
  },
  POST_CODE: {
    REQUIRED: "Post code is required.",
    INVALID: "Please enter a valid post code.",
  },
  CITY: {
    REQUIRED: "City is required.",
  },
  EMAIL: {
    REQUIRED: "Contact email is required.",
    INVALID: "Please enter a valid email address.",
  },
};