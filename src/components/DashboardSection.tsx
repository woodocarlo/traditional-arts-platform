// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState } from 'react';
import { Translation } from '../types';
import { PowerIcon, TrendingUpIcon, CalendarIcon, LightbulbIcon, SparklesIcon, ChartBarIcon, UsersIcon, ChevronRightIcon } from './icons';

const DashboardSection = ({ t }: { t: Translation }) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [isAutopilotOn, setIsAutopilotOn] = useState(false);
    
    const orders = [
        { id: '#K3498', customer: 'R. Verma', item: "Madhubani Painting", location: 'Mumbai, IN', price: '₹4,500', pickup: 'Studio A, Colaba' },
        { id: '#K3497', customer: 'A. Patel', item: "Warli Art Print", location: 'London, UK', price: '£120', pickup: 'International Shipping' },
        { id: '#K3496', customer: 'S. Singh', item: "Bronze Sculpture", location: 'New Delhi, IN', price: '₹12,000', pickup: 'Self-pickup' },
        { id: '#K3495', customer: 'J. Doe', item: "Abstract Canvas", location: 'New York, US', price: '$250', pickup: 'International Shipping' },
        { id: '#K3494', customer: 'P. Kumar', item: "Pattachitra Art", location: 'Bengaluru, IN', price: '₹7,800', pickup: 'Studio C, Indiranagar' },
        { id: '#K3493', customer: 'L. Sharma', item: "Kalamkari Fabric", location: 'Hyderabad, IN', price: '₹5,200', pickup: 'Studio B, Jubilee Hills' },
        { id: '#K3492', customer: 'M. Iyer', item: "Tanjore Painting", location: 'Chennai, IN', price: '₹9,000', pickup: 'Self-pickup' },
        { id: '#K3491', customer: 'N. Das', item: "Blue Pottery Vase", location: 'Jaipur, IN', price: '₹3,500', pickup: 'Studio D, MI Road' },
    ];
    
    const events = [
        { date: 'Sep 20', time: '4:00 PM IST', title: t.liveWorkshop },
        { date: 'Sep 25', time: 'All Day', title: t.onlineTutorial },
    ];
    
    const trends = ["#MadhubaniRevival", "#AIinArt", "#DigitalCanvas", "#FolkArtModern"];

    const toggleExpand = (id: string) => {
        setExpandedOrderId(prevId => (prevId === id ? null : id));
    };
    
    const getConvertedPrice = (price: string) => {
        if (price.startsWith('£')) {
            const amount = parseFloat(price.substring(1));
            return `(approx. ₹${(amount * 105).toLocaleString()})`;
        }
        if (price.startsWith('$')) {
            const amount = parseFloat(price.substring(1));
            return `(approx. ₹${(amount * 83).toLocaleString()})`;
        }
        return '';
    };

    return (
<section id="dashboard" className="py-6 sm:py-12 relative bg-gradient-to-b from-black to-[#4D080F]">

            <div className="relative z-10 container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t.dashboardTitle}</h2>
                    <p className="max-w-2xl mx-auto text-slate-300 text-xl">{t.dashboardSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {/* Creative Autopilot - Top Left */}
                    <div className="lg:col-span-3 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col justify-center relative overflow-hidden border border-slate-700/50">
                        <div className={`absolute inset-0 transition-all duration-700 ${isAutopilotOn ? 'opacity-30 scale-150' : 'opacity-0 scale-100'}`} style={{backgroundImage: 'radial-gradient(circle at center, #FFD700, transparent 70%)'}} />
                        <div className="relative z-10 text-center">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                {t.autopilotTitle}
                            </h3>
                            <p className="text-slate-300 text-sm mb-3">{t.autopilotDesc}</p>
                            <div className="flex items-center justify-center space-x-4 my-2">
                                <span className={`font-medium transition-colors ${!isAutopilotOn ? 'text-white' : 'text-slate-500'}`}>{t.off}</span>
                                <button onClick={() => setIsAutopilotOn(!isAutopilotOn)} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${isAutopilotOn ? 'bg-[#FFD700]' : 'bg-slate-700'}`}>
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 flex items-center justify-center ${isAutopilotOn ? 'translate-x-9' : 'translate-x-1'}`}>
                                        {isAutopilotOn && <PowerIcon className="h-4 w-4 text-[#FFD700]" />}
                                    </span>
                                </button>
                                <span className={`font-medium transition-colors ${isAutopilotOn ? 'text-[#FFD700]' : 'text-slate-500'}`}>{t.on}</span>
                            </div>
                            <p className={`text-sm font-semibold mt-2 ${isAutopilotOn ? 'text-[#FFD700]' : 'text-white'}`}>
                                {isAutopilotOn ? 'Autopilot Engaged! your AI is live' : t.autopilotStandby}
                            </p>
                        </div>
                    </div>

                    {/* Monthly Stats - Top Right */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50">
                         <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                             <ChartBarIcon className="w-5 h-5 mr-2 text-amber-400" />
                             {t.monthlyStats}
                         </h3>
                         <p className="text-slate-300 text-sm mb-4">{t.monthlyStatsDesc}</p>
                         <div className="grid grid-cols-3 gap-4">
                             <div className="text-center p-4 bg-black/30 rounded-xl border border-slate-700/30">
                                 <SparklesIcon className="mx-auto h-8 w-8 text-amber-400 mb-2"/>
                                 <p className="text-2xl font-bold text-white">42</p>
                                 <p className="text-slate-300 text-xs">{t.postsMade}</p>
                             </div>
                             <div className="text-center p-4 bg-black/30 rounded-xl border border-slate-700/30">
                                 <TrendingUpIcon className="mx-auto h-8 w-8 text-amber-400 mb-2"/>
                                 <p className="text-2xl font-bold text-white">₹85K</p>
                                 <p className="text-slate-300 text-xs">{t.totalSales}</p>
                             </div>
                             <div className="text-center p-4 bg-black/30 rounded-xl border border-slate-700/30">
                                 <UsersIcon className="mx-auto h-8 w-8 text-amber-400 mb-2"/>
                                 <p className="text-2xl font-bold text-white">+12%</p>
                                 <p className="text-slate-300 text-xs">{t.audienceGrowth}</p>
                             </div>
                         </div>
                    </div>

                    {/* Pending Orders - Middle Left (tall) */}
                    <div className="lg:col-span-3 row-span-2 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50 relative">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {t.pendingOrders}
                        </h3>
                        <div className="h-96 overflow-y-auto pr-2">
                            <ul className="space-y-3">
                                {orders.map(o => (
                                    <li key={o.id} className="bg-black/30 rounded-lg transition-all duration-300 ease-in-out border border-slate-700/30">
                                        <button onClick={() => toggleExpand(o.id)} className="w-full text-left p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white text-sm">{o.customer}</p>
                                                <p className="text-slate-300 text-xs">{o.item}</p>
                                            </div>
                                            <div className="text-right flex items-center">
                                                 <p className="text-slate-300 text-xs mr-2">{o.location}</p>
                                                 <span className={`inline-block transform transition-transform duration-300 ${expandedOrderId === o.id ? 'rotate-90' : ''}`}>
                                                     <ChevronRightIcon />
                                                 </span>
                                            </div>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedOrderId === o.id ? 'max-h-48' : 'max-h-0'}`}>
                                            <div className="pt-2 pb-4 px-4 border-t border-slate-700 space-y-2">
                                                <p className="text-slate-300 text-xs">{t.order}: <span className="font-mono text-amber-400">{o.id}</span></p>
                                                <p className="text-slate-300 text-xs">{t.price}: <span className="font-bold text-white">{o.price}</span> <span className="text-slate-400">{getConvertedPrice(o.price)}</span></p>
                                                <p className="text-slate-300 text-xs">{t.pickup}: <span className="font-bold text-white">{o.pickup}</span></p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800/90 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Upcoming Events - Middle Right Top */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50">
                         <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                             <CalendarIcon className="w-5 h-5 mr-2 text-amber-400" />
                             {t.upcomingEvents}
                         </h3>
                         <ul className="space-y-4">
                             {events.map((event, index) => (
                                 <li key={`${event.title}-${index}`} className="flex items-start p-3 bg-black/30 rounded-lg border border-slate-700/30">
                                     <div className="bg-amber-400/10 p-2 rounded-lg mr-3">
                                         <p className="text-amber-400 font-bold text-center text-xs">{event.date.split(' ')[0]}</p>
                                         <p className="text-amber-400 font-bold text-center">{event.date.split(' ')[1]}</p>
                                     </div>
                                     <div>
                                        <p className="font-bold text-white text-sm">{event.title}</p>
                                        <p className="text-slate-300 text-xs">{event.time}</p>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                    </div>

                    {/* Trending Topics - Middle Right Bottom */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-slate-700/50 relative">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                             <TrendingUpIcon className="w-5 h-5 mr-2 text-amber-400" />
                             {t.trendingTopics}
                         </h3>
                         <div className="flex flex-wrap gap-2 mb-4">
                             {trends.map(trend => (
                                 <span key={trend} className="text-xs bg-amber-400/10 text-amber-400 py-1.5 px-3 rounded-full flex items-center">
                                     <TrendingUpIcon className="w-3 h-3 mr-1.5 shrink-0"/>
                                     <span>{trend}</span>
                                 </span>
                             ))}
                         </div>
                         <div className="pt-3 border-t border-slate-700 text-left bg-amber-400/5 p-3 rounded-lg">
                             <p className="text-amber-400 text-xs font-bold flex items-center mb-1">
                                 <LightbulbIcon className="w-4 h-4 mr-2 shrink-0" />
                                 {t.aiSuggestion}:
                             </p>
                             <p className="text-slate-200 text-xs">
                                 {t.aiSuggestionText}
                             </p>
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800/90 to-transparent pointer-events-none"></div>
                     </div>
                </div>
            </div>
        </section>
    );
};
export default DashboardSection;
