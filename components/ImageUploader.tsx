import React, { useState, useCallback } from 'react';
import { UploadIcon, CameraIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onOpenGuide: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onOpenGuide }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("画像ファイル（JPEG, PNGなど）を選択してください。");
      }
    }
  }, [onImageUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  return (
    <div>
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
        `}
      >
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold text-indigo-600">クリックしてアップロード</span> またはドラッグ＆ドロップ
          </p>
          <p className="text-xs text-slate-500 mt-1">
            正面を向き、顔全体がはっきりと写った写真を選んでください。<br />
            (NG例: 横顔、帽子、サングラス、強い影)
          </p>
        </div>
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg"
        onChange={(e) => handleFileChange(e.target.files)}
      />
      <div className="flex justify-center mt-4">
        <button 
          onClick={onOpenGuide}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <CameraIcon className="w-5 h-5"/>
          撮影ガイドを見る
        </button>
      </div>
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 mb-2">プレビュー:</p>
          <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
            <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
};