import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          証明写真AI
        </h1>
        <p className="text-slate-500 mt-1">
          アップロードから数秒で、規定に準拠した高品質な証明写真が完成します。
        </p>
      </div>
    </header>
  );
};