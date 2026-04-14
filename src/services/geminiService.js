const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Each model has its own independent free-tier quota
const MODEL_CHAIN = (process.env.GEMINI_MODELS || 'gemini-2.0-flash-lite,gemini-2.0-flash,gemini-2.5-flash-lite,gemini-2.5-flash')
  .split(',')
  .map(m => m.trim());

// Try each model in order — move to next on 429
const withFallback = async (buildRequest) => {
  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      return await buildRequest(model);
    } catch (err) {
      if (err.status === 429) {
        console.warn(`[Gemini] ${modelName} quota exceeded, trying next model...`);
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  const err = new Error('All Gemini models are currently rate limited. Please try again in a minute.');
  err.status = 429;
  throw err;
};

const parseJSON = (text) => {
  const cleaned = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
};

const validateMedicalImage = async ({ imageBase64, mimeType }) => {
  const prompt = `Look at this image carefully. Is this a medical scan or medical report such as an X-Ray, MRI, CT Scan, ultrasound, lab report, blood test report, or any other clinical/diagnostic document?

Respond ONLY with a JSON object in this exact format (no markdown):
{"is_medical": true}
or
{"is_medical": false}`;

  const imagePart = { inlineData: { data: imageBase64, mimeType } };
  try {
    const result = await withFallback(model => model.generateContent([prompt, imagePart]));
    const parsed = parseJSON(result.response.text());
    return parsed.is_medical === true;
  } catch {
    // If validation itself fails, allow through to avoid blocking valid uploads
    return true;
  }
};

const diagnose = async ({ symptoms, severity, duration }) => {
  const prompt = `You are a medical AI assistant. A patient reports the following:
Symptoms: ${symptoms.join(', ')}
Severity: ${severity}
Duration: ${duration}

IMPORTANT INSTRUCTIONS:
- home_therapy: Suggest 3 safe home remedies that will NOT harm the body (e.g. rest, hydration, herbal tea, warm compress). Avoid suggesting any medicines.
- home_therapy_mr: Same 3 home remedies in Marathi (मराठी).
- Keep all fields brief and easy to understand.

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "condition": "most likely condition name",
  "specialist": "type of specialist to consult",
  "urgency": "low | medium | high | emergency",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "home_therapy": ["safe home remedy 1", "safe home remedy 2", "safe home remedy 3"],
  "home_therapy_mr": ["घरगुती उपाय १", "घरगुती उपाय २", "घरगुती उपाय ३"]
}`;

  const result = await withFallback(model => model.generateContent(prompt));
  return parseJSON(result.response.text());
};

const analyzeScan = async ({ imageBase64, mimeType, scanType, symptoms }) => {
  const supportedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedMime.includes(mimeType)) {
    return {
      finding: `${scanType} received. Gemini Vision supports only image files (JPG/PNG). Please upload an image scan.`,
      severity: 'mild',
      recommendation: 'Please upload a JPG or PNG image of your scan for AI analysis.',
    };
  }

  const prompt = `You are an expert medical imaging AI specialized in analyzing ${scanType} scans such as X-rays, MRIs, CT scans, and ultrasounds.
${symptoms?.length ? `The patient has reported these symptoms: ${symptoms.join(', ')}.` : 'No symptoms were provided by the patient.'}

Carefully examine the uploaded medical image and provide a concise analysis.

IMPORTANT INSTRUCTIONS:
- predicted_symptoms_en: Write 2-3 lines in simple English describing the predicted symptoms.
- predicted_symptoms_mr: Write the same 2-3 lines in Marathi (मराठी) describing the predicted symptoms.
- home_therapy: Suggest 3 safe home remedies in English that will NOT harm the body (e.g. rest, warm compress, hydration). No medicines.
- home_therapy_mr: Same 3 home remedies in Marathi (मराठी).
- Keep findings and recommendations brief and clear.

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "finding": "brief 2-3 line description of what is observed in the scan",
  "predicted_symptoms_en": "2-3 line summary of predicted symptoms in English",
  "predicted_symptoms_mr": "2-3 ओळींमध्ये मराठीत अंदाजित लक्षणे",
  "possible_conditions": ["condition 1", "condition 2"],
  "severity": "normal | mild | moderate | severe",
  "affected_area": "specific body part or region observed",
  "recommendation": "brief recommended next steps or specialist to consult",
  "home_therapy": ["safe home remedy 1", "safe home remedy 2", "safe home remedy 3"],
  "home_therapy_mr": ["घरगुती उपाय १", "घरगुती उपाय २", "घरगुती उपाय ३"]
}`;

  const imagePart = { inlineData: { data: imageBase64, mimeType } };
  const result = await withFallback(model => model.generateContent([prompt, imagePart]));

  try {
    return parseJSON(result.response.text());
  } catch {
    return {
      finding: result.response.text().trim() || 'Unable to analyze scan.',
      predicted_symptoms_en: 'Could not predict symptoms. Please try again.',
      predicted_symptoms_mr: 'लक्षणे अंदाज करता आली नाहीत. कृपया पुन्हा प्रयत्न करा.',
      possible_conditions: [],
      severity: 'unknown',
      affected_area: 'unknown',
      recommendation: 'Please consult a doctor for proper diagnosis.',
    };
  }
};

module.exports = { diagnose, analyzeScan, validateMedicalImage };
