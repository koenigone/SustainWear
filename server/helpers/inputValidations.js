const {
  USER_ERROR_CODES,
  USER_ERROR_MESSAGES,
  ADMIN_ERROR_CODES,
  ADMIN_ERROR_MESSAGES,
} = require("../messages/errorMessages");

// --------------------------------------------------------
// USER REGISTER VALIDATION
// --------------------------------------------------------
const validateRegisterInput = ({
  first_name,
  last_name,
  email,
  password,
  confirmPassword,
}) => {
  if (!first_name || !last_name || !email || !password || !confirmPassword) {
    return {
      code: USER_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: USER_ERROR_MESSAGES.USER_ALL_FIELDS_REQUIRED,
    };
  }

  if (first_name.length < 2 || first_name.length > 25) {
    return {
      code: USER_ERROR_CODES.FIRST_NAME_LENGTH,
      message: USER_ERROR_MESSAGES.USER_FIRST_NAME_LENGTH,
    };
  }

  if (last_name.length < 2 || last_name.length > 25) {
    return {
      code: USER_ERROR_CODES.LAST_NAME_LENGTH,
      message: USER_ERROR_MESSAGES.USER_LAST_NAME_LENGTH,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      code: USER_ERROR_CODES.INVALID_EMAIL,
      message: USER_ERROR_MESSAGES.USER_INVALID_EMAIL,
    };
  }

  if (password.length < 8) {
    return {
      code: USER_ERROR_CODES.PASSWORD_TOO_SHORT,
      message: USER_ERROR_MESSAGES.USER_PASSWORD_TOO_SHORT,
    };
  }

  if (password !== confirmPassword) {
    return {
      code: USER_ERROR_CODES.PASSWORDS_DONT_MATCH,
      message: USER_ERROR_MESSAGES.USER_PASSWORDS_DONT_MATCH,
    };
  }

  return null;
};

// --------------------------------------------------------
// USER TWO FACTOR VALIDATION
// --------------------------------------------------------
const validateTwoFactorInput = ({ tempToken, code, record }) => {
  if (!tempToken || !code || !record) {
    return {
      code: USER_ERROR_CODES.INVALID_2FA_SESSION,
      message: USER_ERROR_MESSAGES.USER_INVALID_2FA_SESSION,
    };
  }

  if (Date.now() > record.expires) {
    return {
      code: USER_ERROR_CODES.CODE_EXPIRED,
      message: USER_ERROR_MESSAGES.USER_2FA_CODE_EXPIRED,
    };
  }

  if (record.twoFactorCode !== code) {
    return {
      code: USER_ERROR_CODES.INCORRECT_2FA_CODE,
      message: USER_ERROR_MESSAGES.USER_INCORRECT_2FA_CODE,
    };
  }

  return null;
};

// --------------------------------------------------------
// USER NAME UPDATE VALIDATION
// --------------------------------------------------------
const validateNameInputs = ({ first_name, last_name }) => {
  if (!first_name || !last_name) {
    return {
      code: USER_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: USER_ERROR_MESSAGES.USER_ALL_FIELDS_REQUIRED,
    };
  }

  if (first_name.length < 2 || first_name.length > 25) {
    return {
      code: USER_ERROR_CODES.FIRST_NAME_LENGTH,
      message: USER_ERROR_MESSAGES.USER_FIRST_NAME_LENGTH,
    };
  }

  if (last_name.length < 2 || last_name.length > 25) {
    return {
      code: USER_ERROR_CODES.LAST_NAME_LENGTH,
      message: USER_ERROR_MESSAGES.USER_LAST_NAME_LENGTH,
    };
  }

  return null;
};

// --------------------------------------------------------
// USER PASSWORD RESET VALIDATION
// --------------------------------------------------------
const validatePasswordResetInput = ({
  token,
  newPassword,
  confirmPassword,
}) => {
  if (!token) {
    return {
      code: USER_ERROR_CODES.INVALID_2FA_SESSION,
      message: USER_ERROR_MESSAGES.USER_INVALID_2FA_SESSION,
    };
  }

  if (!newPassword || !confirmPassword) {
    return {
      code: USER_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: USER_ERROR_MESSAGES.USER_ALL_FIELDS_REQUIRED,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      code: USER_ERROR_CODES.PASSWORDS_DONT_MATCH,
      message: USER_ERROR_MESSAGES.USER_PASSWORDS_DONT_MATCH,
    };
  }

  if (newPassword.length < 8) {
    return {
      code: USER_ERROR_CODES.PASSWORD_TOO_SHORT,
      message: USER_ERROR_MESSAGES.USER_PASSWORD_TOO_SHORT,
    };
  }

  return null;
};

// --------------------------------------------------------
// ADMIN ORGANISATION CREATION VALIDATION
// --------------------------------------------------------
const validateOrganisationInput = ({
  name,
  description,
  street_name,
  post_code,
  city,
  contact_email,
}) => {
  if (
    !name ||
    !description ||
    !street_name ||
    !post_code ||
    !city ||
    !contact_email
  ) {
    return {
      code: ADMIN_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: ADMIN_ERROR_MESSAGES.ADMIN_ALL_FIELDS_REQUIRED,
    };
  }

  if (name.length < 4 || name.length > 35) {
    return {
      code: ADMIN_ERROR_CODES.INVALID_ORG_NAME,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_ORG_NAME,
    };
  }

  const postCodeRegex = /^[A-Za-z0-9\s-]{3,10}$/;
  if (!postCodeRegex.test(post_code)) {
    return {
      code: ADMIN_ERROR_CODES.INVALID_POST_CODE,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_POST_CODE,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return {
      code: ADMIN_ERROR_CODES.INVALID_CONTACT_EMAIL,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_CONTACT_EMAIL,
    };
  }

  return null;
};

module.exports = {
  validateRegisterInput,
  validateTwoFactorInput,
  validateNameInputs,
  validatePasswordResetInput,
  validateOrganisationInput,
};