import React from 'react';
import { PhotoStandard, BackgroundColor, Outfit } from '../types';
import { SparklesIcon } from './icons';

interface ControlPanelProps {
  photoStandard: PhotoStandard;
  setPhotoStandard: (standard: PhotoStandard) => void;
  backgroundColor: BackgroundColor;
  setBackgroundColor: (color: BackgroundColor) => void;
  outfit: Outfit;
  setOutfit: (outfit: Outfit) => void;
  enableBeautification: boolean;
  setEnableBeautification: (enabled: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
}

const RadioGroup = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void; }) => (
    <div>
        <h3 className="text-md font-semibold text-slate-600 mb-2">{label}</h3>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${
                        value === option
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  photoStandard,
  setPhotoStandard,
  backgroundColor,
  setBackgroundColor,
  outfit,
  setOutfit,
  enableBeautification,
  setEnableBeautification,
  onGenerate,
  isLoading,
  isReady,
}) => {
  return (
    <div className="space-y-6">
      <RadioGroup
        label="規格"
        value={photoStandard}
        options={Object.values(PhotoStandard)}
        onChange={setPhotoStandard}
      />
      <RadioGroup
        label="背景色"
        value={backgroundColor}
        options={Object.values(BackgroundColor)}
        onChange={setBackgroundColor}
      />
      <RadioGroup
        label="服装"
        value={outfit}
        options={Object.values(Outfit)}
        onChange={setOutfit}
      />

      <div>
        <h3 className="text-md font-semibold text-slate-600 mb-2">美顔・微調整（オプション）</h3>
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
          <div>
            <p className="font-medium text-slate-800">自然な美顔補正を有効にする</p>
            <p className="text-xs text-slate-500 mt-1">肌のキメを整え、顔のバランスを微調整します。</p>
          </div>
          <button
            onClick={() => setEnableBeautification(!enableBeautification)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
              enableBeautification ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={enableBeautification}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enableBeautification ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !isReady}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5"/>
              証明写真を生成
            </>
          )}
        </button>
        {!isReady && <p className="text-xs text-center text-slate-500 mt-2">写真をアップロードすると有効になります。</p>}
      </div>
    </div>
  );
};