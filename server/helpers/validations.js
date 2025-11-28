const { ERROR_CODES } = require("../../shared/errorMessages");

// REGISTER VALIDATION
const validateRegisterInput = ({ first_name, last_name, email, password, confirmPassword }) => {
  if (!first_name || !last_name || !email || !password || !confirmPassword)
    return { code: ERROR_CODES.ALL_FIELDS_REQUIRED };

  if (first_name.length < 2 || first_name.length > 25)
    return { code: ERROR_CODES.FIRST_NAME_LENGTH };

  if (last_name.length < 2 || last_name.length > 25)
    return { code: ERROR_CODES.LAST_NAME_LENGTH };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return { code: ERROR_CODES.INVALID_EMAIL };

  if (password.length < 8)
    return { code: ERROR_CODES.PASSWORD_TOO_SHORT };

  if (password !== confirmPassword)
    return { code: ERROR_CODES.PASSWORDS_DONT_MATCH };

  return null;
};

// TWO FACTOR VALIDATION
const validateTwoFactorInput = ({ tempToken, code, record }) => {
  if (!tempToken || !code)
    return { code: ERROR_CODES.INVALID_2FA_SESSION };

  if (!record)
    return { code: ERROR_CODES.INVALID_2FA_SESSION };

  if (Date.now() > record.expires)
    return { code: ERROR_CODES.CODE_EXPIRED };

  if (record.twoFactorCode !== code)
    return { code: ERROR_CODES.INCORRECT_2FA_CODE };

  return null;
};

// NAME UPDATE VALIDATION
const validateNameInputs = ({ first_name, last_name }) => {
  if (!first_name || !last_name)
    return { code: ERROR_CODES.ALL_FIELDS_REQUIRED };

  if (first_name.length < 2 || first_name.length > 25)
    return { code: ERROR_CODES.FIRST_NAME_LENGTH };

  if (last_name.length < 2 || last_name.length > 25)
    return { code: ERROR_CODES.LAST_NAME_LENGTH };

  return null;
};

// PASSWORD RESET VALIDATION
const validatePasswordResetInput = ({ token, newPassword, confirmPassword }) => {
  if (!token)
    return { code: ERROR_CODES.INVALID_2FA_SESSION };

  if (!newPassword || !confirmPassword)
    return { code: ERROR_CODES.ALL_FIELDS_REQUIRED };

  if (newPassword !== confirmPassword)
    return { code: ERROR_CODES.PASSWORDS_DONT_MATCH };

  if (newPassword.length < 8)
    return { code: ERROR_CODES.PASSWORD_TOO_SHORT };

  return null;
};

// ORGANISATION VALIDATION
const validateOrganisationInput = ({ name, description, street_name, post_code, city, contact_email }) => {
  if (!name || !description || !street_name || !post_code || !city || !contact_email)
    return { code: ERROR_CODES.ALL_FIELDS_REQUIRED };

  if (name.length < 4 || name.length > 35)
    return { code: ERROR_CODES.INVALID_ORG_NAME };

  const postCodeRegex = /^[A-Za-z0-9\s-]{3,10}$/;
  if (!postCodeRegex.test(post_code))
    return { code: ERROR_CODES.INVALID_POST_CODE };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email))
    return { code: ERROR_CODES.INVALID_EMAIL };

  return null;
};

module.exports = {
  validateRegisterInput,
  validateTwoFactorInput,
  validateNameInputs,
  validatePasswordResetInput,
  validateOrganisationInput,
};