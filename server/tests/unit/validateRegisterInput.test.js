const { validateRegisterInput } = require("../../helpers/inputValidations");

describe("validateRegisterInput", () => {
  test("returns error when required fields are missing", () => {
    const input = {
      first_name: "",
      last_name: "User",
      email: "test@test.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    };

    const result = validateRegisterInput(input);
    expect(result).not.toBeNull();
  });

  test("returns null when input is valid", () => {
    const input = {
      first_name: "Test",
      last_name: "User",
      email: "test@test.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    };

    const result = validateRegisterInput(input);
    expect(result).toBeNull();
  });
});