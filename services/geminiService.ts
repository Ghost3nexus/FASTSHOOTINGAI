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

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the API, or a default one
      throw new Error(data.error || 'サーバーでエラーが発生しました。');
    }

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
