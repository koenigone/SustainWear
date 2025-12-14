jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-token"),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}));

const {
  sendPasswordResetEmail,
  sendTwoFactorsMail,
} = require("../../helpers/resetPasswordEmail");

describe("auth mailers", () => {
  test("sendPasswordResetEmail returns success and link", async () => {
    const result = await sendPasswordResetEmail(
      "test@test.com",
      1,
      "http://localhost:5173",
      "Reset",
      "Message"
    );

    expect(result.success).toBe(true);
    expect(result.resetLink).toContain("reset-password");
  });

  test("sendTwoFactorsMail resolves without error", async () => {
    await expect(
      sendTwoFactorsMail("test@test.com", "2FA", "123456")
    ).resolves.not.toThrow();
  });
});