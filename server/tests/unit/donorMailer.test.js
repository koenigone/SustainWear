const mockSendMail = jest.fn().mockResolvedValue(true);

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

const { sendEmail } = require("../../helpers/mailer");

describe("sendEmail", () => {
  test("calls sendMail", async () => {
    await sendEmail("test@test.com", "Subject", "Message");

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});