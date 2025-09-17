"use client";

import React, { Fragment } from 'react';
import { Translation } from '../types';
import { XIcon } from './icons';

const SideNav = ({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: Translation }) => {
  return (
    <Fragment>
      <div className={`fixed inset-y-0 left-0 w-60 bg-gradient-to-b from-slate-800 to-black backdrop-blur-lg border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><XIcon /></button>
          <h2 className="text-xl font-bold text-white mb-6">{t.instructions}</h2>
          <div>
            <h3 className="text-[#F4C430] font-semibold mb-3 text-sm">{t.prototypeNotes}</h3>
            <ul className="text-slate-300 text-sm space-y-3 list-disc list-inside">
              <li>{t.note1}</li>
              <li>{t.note2}</li>
              <li>{t.note3}</li>
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SideNav;