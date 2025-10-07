import { GoogleGenAI, Modality } from "@google/genai";
import type { BackgroundColor, Outfit } from '../types';

// Vercel/Viteのフロントエンド環境変数を正しく読み込むための修正
// Fix: Use process.env.API_KEY as per coding guidelines. This resolves the TypeScript error.
const API_KEY = process.env.API_KEY;

// APIキーが利用可能な場合のみクライアントを初期化
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;


function getBackgroundColorHex(color: BackgroundColor): string {
  switch (color) {
    case '青': return '#a0d8ef';
    case '白': return '#ffffff';
    case 'グレー': return '#f0f0f0';
    default: return '#ffffff';
  }
}

function getOutfitDescription(outfit: Outfit): string {
  switch (outfit) {
    case '男性用スーツ': return 'dark-colored business suit with a white collared shirt and a simple tie';
    case '女性用スーツ': return 'dark-colored business suit with a white blouse';
    default: return 'professional business attire';
  }
}

const beautificationInstructions = `
    6.  **Subtle Beautification Adjustments (Enabled):**
        *   **Goal:** Apply very subtle, natural enhancements that improve photo quality without altering the subject's fundamental appearance. The subject must remain easily identifiable.
        *   **Natural Skin Retouching:** Gently smooth the skin texture to reduce the appearance of temporary blemishes, minor redness, or uneven skin tone. It is critical to **preserve permanent features** like moles, scars, and natural skin texture. The result should look like healthy skin, not an artificial or "airbrushed" filter.
        *   **Minor Symmetry Correction:** If necessary, make microscopic adjustments to facial symmetry, such as subtly balancing the height of eyebrows or eyes. These changes must be so minor that they are not immediately noticeable.
        *   **Eye Enhancement:** Slightly increase the sharpness and clarity of the irises to make the eyes look more awake and lively. Avoid unnatural brightening or color changes.
`;

export const generateIdPhoto = async (
  base64Image: string,
  mimeType: string,
  backgroundColor: BackgroundColor,
  outfit: Outfit,
  enableBeautification: boolean
): Promise<string> => {
  // 関数が呼び出されたタイミングでAPIキーの存在をチェック
  if (!ai) {
    // Vercel/Viteのルールに合わせたエラーメッセージに修正
    // Fix: Updated error message to refer to the correct environment variable.
    throw new Error("APIキーが設定されていません。環境変数に「API_KEY」を設定してください。");
  }

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const candidate = response.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
        throw new Error("生成が安全ポリシーによりブロックされました。不適切な画像である可能性があります。");
    }
    if (!candidate?.content?.parts || candidate.content.parts.length === 0) {
      throw new Error("AIから空のレスポンスが返されました。時間をおいて再度お試しください。");
    }
    
    const imagePart = candidate.content.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return imagePart.inlineData.data;
    }

    const textPart = candidate.content.parts.find(p => p.text);
    if (textPart?.text) {
      throw new Error(`AIからのメッセージ: ${textPart.text}`);
    }
    
    throw new Error("AIが画像を生成できませんでした。別の写真で試すか、設定を変更してください。");

  } catch (error) {
    console.error("証明写真の生成中にエラーが発生しました:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("不明なエラーにより写真の生成に失敗しました。");
  }
};