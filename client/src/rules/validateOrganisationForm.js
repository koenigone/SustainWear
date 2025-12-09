import { ADMIN_RULES } from "./adminRules";

export function validateOrganisationForm(data) {
  const { name, description, street_name, post_code, city, contact_email } =
    data;

  // name
  if (!name.trim()) {
    return { valid: false, message: ADMIN_RULES.NAME.REQUIRED };
  }
  if (name.trim().length < 2 || name.trim().length > 50) {
    return { valid: false, message: ADMIN_RULES.NAME.LENGTH };
  }

  // description
  if (!description.trim()) {
    return { valid: false, message: ADMIN_RULES.DESCRIPTION.REQUIRED };
  }
  if (description.trim().length < 5 || description.trim().length > 200) {
    return { valid: false, message: ADMIN_RULES.DESCRIPTION.LENGTH };
  }

  // street
  if (!street_name.trim()) {
    return { valid: false, message: ADMIN_RULES.STREET.REQUIRED };
  }

  // post code
  if (!post_code.trim()) {
    return { valid: false, message: ADMIN_RULES.POST_CODE.REQUIRED };
  }

  const trimmedPost = post_code.trim();

  if (trimmedPost.length < 3 || trimmedPost.length > 15) {
    return { valid: false, message: ADMIN_RULES.POST_CODE.INVALID };
  }

  // city
  if (!city.trim()) {
    return { valid: false, message: ADMIN_RULES.CITY.REQUIRED };
  }

  // email
  if (!contact_email.trim()) {
    return { valid: false, message: ADMIN_RULES.EMAIL.REQUIRED };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return { valid: false, message: ADMIN_RULES.EMAIL.INVALID };
  }

  return { valid: true };
}