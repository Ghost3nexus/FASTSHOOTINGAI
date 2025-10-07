import React, { useState, useEffect } from 'react';
import { DownloadIcon, ClipboardIcon, RefreshIcon } from './icons';

interface ResultViewerProps {
  originalImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

const loadingMessages = [
    "AIが最適なスーツを選んでいます...",
    "プロの照明を調整しています...",
    "顔の向きを補正しています...",
    "背景をきれいにしています...",
    "最後の仕上げを適用中です..."
];

const LoadingSkeleton: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="w-full aspect-[3/4] bg-slate-200 rounded-lg animate-pulse flex flex-col items-center justify-center p-4"
            aria-live="polite"
            aria-atomic="true"
        >
            <svg className="w-12 h-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="mt-4 text-sm font-semibold text-slate-500 text-center">AIが証明写真を生成中です...</p>
            <p className="mt-2 text-sm text-slate-500 text-center transition-opacity duration-500">{message}</p>
        </div>
    );
};

const Placeholder: React.FC = () => (
    <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-dashed">
        <svg className="w-16 h-16 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="mt-4 font-semibold text-slate-600">生成された写真がここに表示されます</p>
        <p className="text-sm text-slate-500">写真をアップロードしてオプションを選択し、「生成」ボタンを押してください。</p>
    </div>
);


export const ResultViewer: React.FC<ResultViewerProps> = ({ generatedImage, isLoading, error, onReset }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'id_photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
        console.error("Failed to copy image:", err);
        alert("画像のコピーに失敗しました。お使いのブラウザが対応していない可能性があります。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow h-full">
      <div className="w-full max-w-sm mx-auto">
        {isLoading && <LoadingSkeleton />}
        {!isLoading && error && (
            <div className="w-full aspect-[3/4] bg-red-50 border-red-200 border rounded-lg flex flex-col items-center justify-center p-4 text-center" role="alert">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 font-semibold text-red-700">生成に失敗しました</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
        )}
        {!isLoading && !error && generatedImage && (
          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border">
            <img src={generatedImage} alt="生成された証明写真" className="w-full h-full object-contain bg-slate-100" />
          </div>
        )}
        {!isLoading && !error && !generatedImage && <Placeholder />}
      </div>
      
      {generatedImage && !isLoading && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
                <DownloadIcon />
                ダウンロード
            </button>
            <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
                disabled={copyStatus === 'copied'}
            >
                <ClipboardIcon />
                {copyStatus === 'copied' ? 'コピーしました！' : 'コピー'}
            </button>
            <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200"
            >
                <RefreshIcon />
                新しく作成
            </button>
        </div>
      )}
       {!isLoading && error && (
            <button
                onClick={onReset}
                className="mt-6 flex items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200"
            >
                <RefreshIcon />
                やり直す
            </button>
       )}
    </div>
  );
};