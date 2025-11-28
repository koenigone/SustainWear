const ERROR_CODES = {
  ALL_FIELDS_REQUIRED: "ALL_FIELDS_REQUIRED",
  FIRST_NAME_LENGTH: "FIRST_NAME_LENGTH",
  LAST_NAME_LENGTH: "LAST_NAME_LENGTH",
  INVALID_EMAIL: "INVALID_EMAIL",
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  PASSWORDS_DONT_MATCH: "PASSWORDS_DONT_MATCH",
  INVALID_2FA_SESSION: "INVALID_2FA_SESSION",
  CODE_EXPIRED: "CODE_EXPIRED",
  INCORRECT_2FA_CODE: "INCORRECT_2FA_CODE",
  INVALID_ORG_NAME: "INVALID_ORG_NAME",
  INVALID_POST_CODE: "INVALID_POST_CODE",
};

const ERROR_MESSAGES = {
  ALL_FIELDS_REQUIRED: "All fields are required",
  FIRST_NAME_LENGTH: "First name should be between 2 and 25 characters",
  LAST_NAME_LENGTH: "Last name should be between 2 and 25 characters",
  INVALID_EMAIL: "Invalid email format",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  INVALID_2FA_SESSION: "Invalid or expired session",
  CODE_EXPIRED: "Code expired",
  INCORRECT_2FA_CODE: "Incorrect code",
  INVALID_ORG_NAME: "Organisation name must be between 4 and 35 characters",
  INVALID_POST_CODE: "Invalid post code format",
};

module.exports = { 
  ERROR_CODES,
  ERROR_MESSAGES
};