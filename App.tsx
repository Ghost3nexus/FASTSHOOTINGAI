import React, { useState, useCallback } from 'react';
import { PhotoStandard, BackgroundColor, Outfit } from './types';
import { generateIdPhoto } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultViewer } from './components/ResultViewer';
import { WarningIcon } from './components/icons';
import { ShootingGuideModal } from './components/ShootingGuideModal';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [uploaderKey, setUploaderKey] = useState<number>(Date.now());

  const [photoStandard, setPhotoStandard] = useState<PhotoStandard>(PhotoStandard.Resume);
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>(BackgroundColor.Blue);
  const [outfit, setOutfit] = useState<Outfit>(Outfit.MaleSuit);
  const [enableBeautification, setEnableBeautification] = useState<boolean>(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setOriginalMimeType(file.type);
      setGeneratedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage) {
      setError("まず写真をアップロードしてください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const resultBase64 = await generateIdPhoto(base64Data, originalMimeType, backgroundColor, outfit, enableBeautification);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalMimeType, backgroundColor, outfit, enableBeautification]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setOriginalMimeType('');
    setGeneratedImage(null);
    setError(null);
    setUploaderKey(Date.now()); // Force re-mount of ImageUploader to reset its internal state
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col space-y-6">
            <h2 className="text-xl font-bold text-slate-700 border-b pb-3">1. 写真をアップロード</h2>
            <ImageUploader key={uploaderKey} onImageUpload={handleImageUpload} onOpenGuide={() => setIsGuideOpen(true)} />
            
            <h2 className="text-xl font-bold text-slate-700 border-b pb-3">2. オプションを選択</h2>
            <ControlPanel
              photoStandard={photoStandard}
              setPhotoStandard={setPhotoStandard}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              outfit={outfit}
              setOutfit={setOutfit}
              enableBeautification={enableBeautification}
              setEnableBeautification={setEnableBeautification}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isReady={!!originalImage}
            />
          </div>

          {/* Right Column: Result */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 border-b pb-3">3. 結果を確認</h2>
            <ResultViewer 
              originalImage={originalImage}
              generatedImage={generatedImage}
              isLoading={isLoading}
              error={error}
              onReset={handleReset}
            />
             <div className="mt-auto pt-4">
               <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 rounded-md" role="alert">
                  <div className="flex">
                    <div className="py-1"><WarningIcon className="h-6 w-6 text-amber-400 mr-4" /></div>
                    <div>
                      <p className="font-bold">重要：利用上の注意</p>
                      <p className="text-sm">
                        生成された写真は、公的証明書として利用する前に、必ず各機関の規定を満たしているかご自身の責任でご確認ください。
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2024 証明写真AI. All rights reserved.</p>
        <p className="mt-1 space-x-4">
            <a href="#" className="hover:underline">利用規約</a>
            <span>・</span>
            <a href="#" className="hover:underline">プライバシーポリシー</a>
        </p>
      </footer>
      <ShootingGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;