// This is a Vercel Serverless Function that runs in a Node.js environment.
// To use types like VercelRequest and VercelResponse, you might need to install `@types/node`
// and potentially `@vercel/node` as dev dependencies, but Vercel's build environment
// usually handles this automatically.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";
import type { BackgroundColor, Outfit } from '../types';

// Helper function to get background color hex code
function getBackgroundColorHex(color: BackgroundColor): string {
  switch (color) {
    case '青': return '#a0d8ef';
    case '白': return '#ffffff';
    case 'グレー': return '#f0f0f0';
    default: return '#ffffff';
  }
}

// Helper function to get outfit description for the prompt
function getOutfitDescription(outfit: Outfit): string {
  switch (outfit) {
    case '男性用スーツ': return 'dark-colored business suit with a white collared shirt and a simple tie';
    case '女性用スーツ': return 'dark-colored business suit with a white blouse';
    default: return 'professional business attire';
  }
}

// Simplified instructions for the AI model regarding beautification
const beautificationInstructions = `
    6.  **Beautification:** Apply subtle, natural skin smoothing to reduce minor blemishes, but preserve permanent features like moles and scars. Slightly enhance eye clarity.
`;

// The main handler for the serverless function
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { base64Image, mimeType, backgroundColor, outfit, enableBeautification } = req.body;

  // Validate request body
  if (!base64Image || !mimeType || !backgroundColor || !outfit || typeof enableBeautification === 'undefined') {
    return res.status(400).json({ error: 'Missing required parameters in request body.' });
  }
  
  const API_KEY = process.env.API_KEY;

  // Check for API key on the server with a more detailed error message
  if (!API_KEY) {
    // Log available environment variables for debugging (BE CAREFUL NOT TO LOG SENSITIVE VALUES)
    console.log('Available environment variable keys:', Object.keys(process.env));
    console.error("API_KEY environment variable is missing or empty.");
    return res.status(500).json({ 
        error: "サーバー側のAPIキー設定に問題があります。Vercelプロジェクトの「Settings」 > 「Environment Variables」で、`API_KEY` という名前の環境変数が正しく設定され、「Production」環境に適用されているか確認してください。設定後は再デプロイが必要です。" 
    });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Construct a more concise prompt for the Gemini API to prevent timeouts
  const prompt = `
    As an expert AI photo editor, transform the user's photo into a professional ID photo following these rules:

    1.  **Clothing:** Change the attire to a ${getOutfitDescription(outfit)}. Ensure it fits naturally.
    2.  **Background:** Replace the original background with a solid, smooth color: ${getBackgroundColorHex(backgroundColor)}.
    3.  **Composition:** Center the subject, looking forward. Adjust head tilt so the eye-line is horizontal. Ensure proper headroom for an ID photo.
    4.  **Lighting & Quality:** Re-light the subject with soft, professional studio lighting. Eliminate harsh shadows. The final image must be sharp, clear, high-resolution, and suitable for printing.
    5.  **Identity:** CRITICAL: Do not alter core facial features (eyes, nose, mouth, face shape). The subject must be easily identifiable.
    ${enableBeautification 
        ? beautificationInstructions
        : '6. **Beautification:** All cosmetic adjustments are disabled.'
    }

    Output only the final image file.
    `;

  try {
    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const candidate = response.candidates?.[0];

    // Handle safety blocks and other non-successful responses
    if (candidate?.finishReason === 'SAFETY') {
        return res.status(400).json({ error: "生成が安全ポリシーによりブロックされました。不適切な画像である可能性があります。" });
    }
    if (!candidate?.content?.parts || candidate.content.parts.length === 0) {
      return res.status(500).json({ error: "AIから空のレスポンスが返されました。時間をおいて再度お試しください。" });
    }
    
    // Find and return the image part from the response
    const imagePart = candidate.content.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return res.status(200).json({ base64Image: imagePart.inlineData.data });
    }

    // Handle cases where only text is returned (e.g., an error or refusal from the model)
    const textPart = candidate.content.parts.find(p => p.text);
    if (textPart?.text) {
      return res.status(500).json({ error: `AIからのメッセージ: ${textPart.text}` });
    }
    
    return res.status(500).json({ error: "AIが画像を生成できませんでした。別の写真で試すか、設定を変更してください。" });

  } catch (error) {
    console.error("Error generating ID photo in serverless function:", error);
    const message = error instanceof Error ? error.message : "不明なエラーが発生しました。";
    return res.status(500).json({ error: message });
  }
}