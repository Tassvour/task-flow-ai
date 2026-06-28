const { GoogleGenerativeAI } = require("@google/generative-ai");

// POST /api/ai/suggest-estimate
const suggestEstimate = async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a project management assistant. Given the following task details, suggest an estimated effort and a due date.

Task Title: ${title}
Description: ${description || "No description provided"}
Priority: ${priority || "medium"}

Respond in this exact JSON format only, no extra text:
{
  "estimatedEffort": "e.g. 2 hours or 3 days",
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoning": "One sentence explanation"
}
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response (strip markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const suggestion = JSON.parse(jsonMatch[0]);
    res.json(suggestion);
  } catch (error) {
    console.error("Gemini AI error:", error.message);

    // Fallback response when AI fails
    res.json({
      estimatedEffort: "2–4 hours",
      suggestedDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reasoning: "AI suggestion unavailable. Using a general estimate.",
      isFallback: true,
    });
  }
};

module.exports = { suggestEstimate };
