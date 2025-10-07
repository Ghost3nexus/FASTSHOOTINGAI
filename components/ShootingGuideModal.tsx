import React from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from './icons';

interface ShootingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideItem: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
  <li className="flex items-start space-x-3 text-slate-700">
    <div className="flex-shrink-0 pt-0.5">{icon}</div>
    <span>{text}</span>
  </li>
);

export const ShootingGuideModal: React.FC<ShootingGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-transform duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
            <h2 id="guide-title" className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                撮影ガイド
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="閉じる"
            >
                <XIcon className="h-6 w-6" />
            </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 良い例 */}
            <div>
                <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 mr-2" />
                良い例 (OK)
                </h3>
                <ul className="space-y-3 text-sm">
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="正面を向いて、カメラをまっすぐ見る" />
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="無表情、または自然な微笑み" />
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="顔全体に均一に光が当たっている（影がない）" />
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="背景は無地でスッキリしている" />
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="顔や目元が髪で隠れていない" />
                <GuideItem icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} text="ピントが合っており、鮮明である" />
                </ul>
            </div>
            {/* 悪い例 */}
            <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <XCircleIcon className="w-6 h-6 mr-2" />
                悪い例 (NG)
                </h3>
                <ul className="space-y-3 text-sm">
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="横顔や、顔が傾いている" />
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="帽子、サングラス、マスクを着用" />
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="顔に強い影がある、または逆光" />
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="背景に物や柄が写り込んでいる" />
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="歯が見えるほどの笑顔や変顔" />
                <GuideItem icon={<XCircleIcon className="w-5 h-5 text-red-500" />} text="写真がピンボケしている、または画質が低い" />
                </ul>
            </div>
            </div>

            <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
                閉じる
            </button>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
