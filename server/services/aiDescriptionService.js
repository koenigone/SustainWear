const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateItemDescription = async (data) => {
  const { item_name, category, item_condition, size, gender } = data;

  // promt to generate donation description
  const prompt = `
  Generate a short, friendly donation description for:
  - Name: ${item_name}
  - Category: ${category}
  - Condition: ${item_condition}
  - Size: ${size}
  - Gender: ${gender}

  The description must be friendly, 2–3 sentences, clear, and suitable for a charity donation platform.
  Do NOT use emojis. Keep it under 60 words.
  `;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  if (!response || !response.output_text) {
    throw new Error("AI returned empty output_text");
  }

  return response.output_text;
};

module.exports = generateItemDescription;