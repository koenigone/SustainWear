// validate registeration user input
const validateRegisterInput = ({ first_name, last_name, email, password, confirmPassword }) => {
  if (!first_name || !last_name || !email || !password || !confirmPassword)
    return "All fields are required";

  if (first_name.length < 2 || first_name.length > 25)
    return "First name should be between 2 and 25 characters";

  if (last_name.length < 2 || last_name.length > 25)
    return "Last name should be between 2 and 25 characters";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return "Invalid email format";

  if (password.length < 8)
    return "Password must be at least 8 characters long";

  if (password !== confirmPassword)
    return "Passwords do not match";

  return null; // valid
};

// validate two factor code input
const validateTwoFactorInput = ({ tempToken, code, record }) => {
  if (!tempToken || !code)
    return "Missing verification data";

  if (!record)
    return "Invalid or expired session";

  if (Date.now() > record.expires)
    return "Code expired";

  if (record.twoFactorCode !== code)
    return "Incorrect code";

  return null; // valid
}

const validateNameInputs = (first_name, last_name) => {
  if (!first_name || !last_name) {
    return "First and last name are required";
  }

  if (first_name.length < 2 || first_name.length > 25) {
    return "First name must be between 2 and 25 characters";
  }

  if (last_name.length < 2 || last_name.length > 25) {
    return "Last name must be between 2 and 25 characters";
  }

  return null; // valid
}

const validatePasswordResetInput = ({ token, newPassword, confirmPassword }) => {
  if (!token)
    return "Token not found, please request another email";

  if (!newPassword || !confirmPassword)
    return "All fields are required";

  if (newPassword !== confirmPassword)
    return "Passwords do not match";

  if (newPassword.length < 8)
    return "New password must be at least 8 characters long";

  return null; // valid
}

// validate organisation creation
const validateOrganisationInput = ({ name, description, street_name, post_code, city, contact_email }) => {
  if (!name || !description || !street_name || !post_code || !city || !contact_email) {
    return "All fields are required";
  }

  if (name.length < 4 || name.length > 35) {
    return "Organisation name must be between 4 and 35 characters";
  }

  if (description.length < 4 || description.length > 99) {
    return "Organisation description must be between 4 and 99 characters";
  }

  if (street_name.length < 2 || street_name.length > 30) {
    return "Street name must be between 2 and 30 characters";
  }

  const postCodeRegex = /^[A-Za-z0-9\s-]{3,10}$/;
  if (!postCodeRegex.test(post_code)) {
    return "Invalid post code format";
  }

  if (city.length < 2 || city.length > 35) {
    return "City name must be between 2 and 35 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return "Invalid contact email format";
  }

  return null; // valid
}

module.exports = {
  validateRegisterInput,
  validateTwoFactorInput,
  validateNameInputs,
  validatePasswordResetInput,
  validateOrganisationInput,
}