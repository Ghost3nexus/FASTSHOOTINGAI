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

// Detailed instructions for the AI model regarding beautification
const beautificationInstructions = `
    6.  **Subtle Beautification Adjustments (Enabled):**
        *   **Goal:** Apply very subtle, natural enhancements that improve photo quality without altering the subject's fundamental appearance. The subject must remain easily identifiable.
        *   **Natural Skin Retouching:** Gently smooth the skin texture to reduce the appearance of temporary blemishes, minor redness, or uneven skin tone. It is critical to **preserve permanent features** like moles, scars, and natural skin texture. The result should look like healthy skin, not an artificial or "airbrushed" filter.
        *   **Minor Symmetry Correction:** If necessary, make microscopic adjustments to facial symmetry, such as subtly balancing the height of eyebrows or eyes. These changes must be so minor that they are not immediately noticeable.
        *   **Eye Enhancement:** Slightly increase the sharpness and clarity of the irises to make the eyes look more awake and lively. Avoid unnatural brightening or color changes.
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
        error: "APIキーが環境変数に設定されていないか、空です。Vercelプロジェクトの「Settings」 > 「Environment Variables」で、`API_KEY` という名前でキーが正しく設定されており、「Production」環境に適用されているか確認してください。設定後は再デプロイが必要です。" 
    });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Construct the prompt for the Gemini API
  const prompt = `
    You are an expert AI photo editor specializing in professional headshots and official identification photos.
    Your task is to transform the user's uploaded photo into a high-quality, regulation-compliant ID photo.

    **Instructions:**

    1.  **Attire Replacement:**
        *   Change the subject's clothing to a ${getOutfitDescription(outfit)}.
        *   The clothing must look natural, fitting the subject's posture and body shape.
        *   Pay close attention to a seamless blend around the neck and shoulders.

    2.  **Background Replacement:**
        *   Remove the original background entirely.
        *   Replace it with a smooth, uniform, solid-colored background with the hex code ${getBackgroundColorHex(backgroundColor)}.

    3.  **Composition and Framing:**
        *   The subject must be perfectly centered and facing directly forward.
        *   Adjust the head position to meet standard ID photo requirements (e.g., passport photos), ensuring there is appropriate headroom.
        *   Correct any minor head tilt to ensure the eye-line is horizontal.

    4.  **Lighting and Image Quality:**
        *   Re-light the subject using a professional **three-point lighting setup (key, fill, and back lights)** to ensure the face is evenly illuminated without any harsh shadows, especially under the nose or eyes.
        *   The lighting should be soft and diffused, characteristic of a professional photo studio.
        *   Ensure there's a subtle **catchlight** in the eyes to add life and dimension.
        *   The final image must be of **ultra-high-resolution photorealistic quality**. Generate the final image with dimensions suitable for a high-resolution print (e.g., at least 1200x1600 pixels), equivalent to 300 DPI, to ensure it is optimized for professional-quality printing.
        *   The final image must be exceptionally sharp, clear, and free of any digital artifacts, blurriness, or compression noise.

    5.  **Preserve Identity (Strict Constraint):**
        *   This is the most important rule. You must **not** alter the subject's core facial features (eyes, nose, mouth, face shape) in any way that would make them difficult to identify. The expression should remain neutral and professional.
        *   ${!enableBeautification ? 'All forms of beautification, skin smoothing, or cosmetic filtering are strictly forbidden.' : ''}

    ${enableBeautification ? beautificationInstructions : ''}

    **Final Output:**
    The output must ONLY be the final, edited image file. Do not include any text, logos, or other information.
    `;

  try {
    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gem-2.5-flash-image',
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
