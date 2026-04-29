import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://poafindir-rgb.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { prompt, imageBase64, mimeType } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const content = [
      {
        type: "input_text",
        text: prompt,
      },
    ];

    if (imageBase64) {
      content.push({
        type: "input_image",
        image_url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content,
        },
      ],
    });

    return res.status(200).json({
      text: response.output_text || "",
    });
  } catch (error) {
    console.error("OpenAI backend error:", error);

    return res.status(500).json({
      error: "OpenAI analysis failed",
      details: String(error?.message || error),
    });
  }
}
