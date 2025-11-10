"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useEditorStore } from './components/store';

import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ChooseCanvasSizeModal from './components/ChooseCanvasSizeModal';

const CanvasArea = dynamic(() => import('./components/CanvasArea'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-800">
      <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
    </div>
  ),
});

export default function CreateYourOwnPage() {
  const { canvasSize, downloadCanvas } = useEditorStore();

  const handleDownload = () => {
    downloadCanvas();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-[#1a1a2e] to-[#161625] text-white">
      <Header onDownload={handleDownload} />

      {!canvasSize ? (
        <ChooseCanvasSizeModal />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Main Canvas Area */}
          <main className="flex-1 overflow-auto">
            <CanvasArea />
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
