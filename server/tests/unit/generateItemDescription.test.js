const mockCreate = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    responses: {
      create: mockCreate,
    },
  }));
});

const generateItemDescription = require("../../services/aiDescriptionService");

describe("generateItemDescription", () => {
  test("throws error when AI returns empty output", async () => {
    mockCreate.mockResolvedValue({ output_text: null });

    await expect(
      generateItemDescription({
        item_name: "Jacket",
        category: "Outerwear",
        item_condition: "Good",
        size: "M",
        gender: "Unisex",
      })
    ).rejects.toThrow("AI returned empty output_text");
  });
});