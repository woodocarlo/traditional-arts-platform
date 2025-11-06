import React from 'react';

const Header = () => {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-slate-800/50 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Create Your Own</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    </header>
  );
};

export default Header;
