// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- Icon Components (keep all your existing icons) ---
const PowerIcon = ({className}: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>
);
const TrendingUpIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>);
const CalendarIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const LightbulbIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18h6M12 22V18M9 14.02V14a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v.02M12 2a7.3 7.3 0 0 0-4.63 12.63C7.8 15.07 9 15.45 9 16.5V18h6v-1.5c0-1.05 1.2-1.43 1.63-1.87A7.3 7.3 0 0 0 12 2z"></path></svg>);
const SparklesIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73z"></path></svg>);
const ChartBarIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"></path></svg>);
const UsersIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6M23 11h-6"></path></svg>);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const FacebookIcon = ({className}: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>);
const InstagramIcon = ({className}: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"></path></svg>
);
const TwitterIcon = ({className}: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.218 3.799 4.661-.428.116-.88.178-1.348.178-.285 0-.56-.027-.83-.079.613 1.943 2.413 3.328 4.544 3.365-1.789 1.399-4.049 2.203-6.447 2.203-.418 0-.83-.024-1.23-.07 2.289 1.453 5.013 2.301 7.913 2.301 9.493 0 14.693-7.859 14.693-14.693 0-.224-.005-.447-.014-.67.998-.722 1.864-1.622 2.56-2.658z"></path></svg>
);

const DashboardSection = ({ t }: { t: any }) => {
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
