const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const diagnose = async ({ symptoms, severity, duration }) => {
  const prompt = `You are a medical AI assistant. A patient reports the following:
Symptoms: ${symptoms.join(', ')}
Severity: ${severity}
Duration: ${duration}

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "condition": "most likely condition name",
  "specialist": "type of specialist to consult",
  "urgency": "low | medium | high | emergency",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
};

const analyzeScan = async ({ imageBase64, mimeType, scanType, symptoms }) => {
  const prompt = `You are a medical imaging AI. Analyze this ${scanType} scan.
${symptoms?.length ? `Patient symptoms: ${symptoms.join(', ')}` : ''}

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "finding": "description of what is observed in the scan",
  "severity": "normal | mild | moderate | severe",
  "recommendation": "recommended next steps or follow-up"
}`;

  // Gemini Vision only supports image mimetypes
  const supportedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedMime.includes(mimeType)) {
    return {
      finding: `${scanType} received. Gemini Vision supports only image files (JPG/PNG). Please upload an image scan.`,
      severity: 'mild',
      recommendation: 'Please upload a JPG or PNG image of your scan for AI analysis.',
    };
  }

  const imagePart = { inlineData: { data: imageBase64, mimeType } };
  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();
  // Strip markdown code blocks if present
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { diagnose, analyzeScan };
