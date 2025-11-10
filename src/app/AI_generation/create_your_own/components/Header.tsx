import React from 'react';
import { X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onDownload?: () => void;
}

const Header = ({ onDownload }: HeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/AI_generation');
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-slate-800/50 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Create Your Own</h1>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Download Canvas"
            >
              <Download size={20} />
            </button>
          )}
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
