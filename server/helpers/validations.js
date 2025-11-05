function validateUserInput({ first_name, last_name, email, password, confirmPassword }) {
  if (!first_name || !last_name || !email || !password || !confirmPassword)
    return "All fields are required";

  if (first_name.length < 4 || first_name.length > 40)
    return "First name should be between 4 and 40 characters";

  if (last_name.length < 4 || last_name.length > 40)
    return "Last name should be between 4 and 40 characters";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return "Invalid email format";

  if (password.length < 8)
    return "Password must be at least 8 characters long";

  if (password !== confirmPassword)
    return "Passwords do not match";

  return null;
};

function validateTwoFactorInput({ tempToken, code, record }) {
  if (!tempToken || !code)
    return "Missing verification data";

  if (!record)
    return "Invalid or expired session";

  if (Date.now() > record.expires)
    return "Code expired";

  if (record.twoFactorCode !== code)
    return "Incorrect code";

  return null;
}

module.exports = { 
  validateUserInput, 
  validateTwoFactorInput 
}