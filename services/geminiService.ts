import type { BackgroundColor, Outfit } from '../types';

export const generateIdPhoto = async (
  base64Image: string,
  mimeType: string,
  backgroundColor: BackgroundColor,
  outfit: Outfit,
  enableBeautification: boolean
): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        mimeType,
        backgroundColor,
        outfit,
        enableBeautification,
      }),
    });

    if (!response.ok) {
      let errorMessage = `サーバーエラーが発生しました (ステータス: ${response.status})。`;
      try {
        // Try to parse error response as JSON, as intended by the API
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If the response is not JSON (e.g., a Vercel timeout page), read it as text
        try {
          const errorText = await response.text();
          // Avoid showing a huge HTML page as an error
          errorMessage = errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '');
        } catch (textError) {
          // Fallback if reading text also fails
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.base64Image) {
      throw new Error("サーバーから画像データが返されませんでした。");
    }

    return data.base64Image;
  } catch (error) {
    console.error("API呼び出し中にエラーが発生しました:", error);
    if (error instanceof Error) {
      // Rethrow the error to be caught by the UI component
      throw error;
    }
    throw new Error("不明なエラーにより写真の生成に失敗しました。");
  }
};