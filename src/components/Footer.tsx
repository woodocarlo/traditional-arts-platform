"use client";

import React from 'react';
import { Translation } from '../types';
import { TwitterIcon, InstagramIcon, LinkedInIcon } from './icons';

export const Footer = ({ t }: { t: Translation }) => (
    <footer className="bg-black/30 border-t border-slate-800/50 py-6">
        <div className="container mx-auto px-4 text-center text-slate-400">
            <div className="flex justify-center space-x-6 mb-3">
                <a href="#"><TwitterIcon className="text-slate-400 hover:text-white transition-colors" /></a>
                <a href="#"><InstagramIcon className="text-slate-400 hover:text-white transition-colors" /></a>
                <a href="#"><LinkedInIcon /></a>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} Kalaसखी. {t.footerRights}</p>
        </div>
    </footer>
);

export default Footer;