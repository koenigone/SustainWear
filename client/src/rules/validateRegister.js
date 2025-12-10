import { USER_RULES } from "./userRules";

export function validateRegisterForm(form) {
  const { first_name, last_name, email, password, confirmPassword } = form;

  // first name
  if (!first_name.trim()) {
    return { valid: false, message: USER_RULES.FIRST_NAME.REQUIRED };
  }
  if (first_name.trim().length < 2 || first_name.trim().length > 25) {
    return { valid: false, message: USER_RULES.FIRST_NAME.LENGTH };
  }

  // last name
  if (!last_name.trim()) {
    return { valid: false, message: USER_RULES.LAST_NAME.REQUIRED };
  }
  if (last_name.trim().length < 2 || last_name.trim().length > 25) {
    return { valid: false, message: USER_RULES.LAST_NAME.LENGTH };
  }

  // email
  if (!email.trim()) {
    return { valid: false, message: USER_RULES.EMAIL.REQUIRED };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: USER_RULES.EMAIL.INVALID };
  }

  // password
  if (!password) {
    return { valid: false, message: USER_RULES.PASSWORD.REQUIRED };
  }
  if (password.length < 8) {
    return { valid: false, message: USER_RULES.PASSWORD.LENGTH };
  }

  // confirm
  if (password !== confirmPassword) {
    return { valid: false, message: USER_RULES.CONFIRM_PASSWORD.MATCH };
  }

  return { valid: true, message: "" };
}