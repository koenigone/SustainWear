export function validateLogin(form) {
  const { email, password } = form;
  let errors = {};

  if (!email.trim()) {
    errors.email = "Please enter your email.";
  }

  if (!password.trim()) {
    errors.password = "Please enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}