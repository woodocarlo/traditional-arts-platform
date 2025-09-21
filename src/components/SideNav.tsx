"use client";

import React, { Fragment } from 'react';
import { Translation } from '../types';
import { XIcon } from './icons';
import { useInstructions } from '@/contexts/InstructionsContext';

const SideNav = ({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: Translation }) => {
  const { instructions } = useInstructions();
  
  return (
    <Fragment>
      <div className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-800 to-black backdrop-blur-lg border-r border-slate-700 z-[45] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><XIcon /></button>
          <h2 className="text-xl font-bold text-white mb-6">{t.instructions}</h2>
          <div className="text-slate-300 text-sm space-y-3">
            {instructions}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SideNav;