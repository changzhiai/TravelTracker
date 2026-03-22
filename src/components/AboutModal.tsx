

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-center p-4 pb-24 md:pb-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 transform transition-all overflow-hidden my-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        About
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* 1. About the app */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            About the App
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm text-justify">
                            Travel Tracker is your personal companion for visualizing your global adventures.
                            Track world countries, US states, European countries, Chinese provinces, Indian states, and US national parks that you've visited, view statistics, and share your travel map with the world.
                        </p>
                    </div>

                    {/* 2. Contributions */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                            Contributions
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm text-justify">
                            This project is built with passion. Special thanks to the open-source community for the tools and libraries that made this possible. You are open to contribute ideas, bug reports, and feature requests to our <a href="https://github.com/changzhiai/TravelTracker" className="text-indigo-600 hover:text-indigo-800 font-medium">GitHub repository</a>.
                        </p>
                    </div>

                    {/* 3. Contacts */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            Contacts
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm text-justify">
                            Have questions, suggestions, or feedback? Feel free to reach out to us at <a href="mailto:changzhiai@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium">changzhiai@gmail.com</a>.
                        </p>
                    </div>

                    {/* 4. Donation */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            Donation
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4 text-justify">
                            This is completely a free app. If you enjoy using Travel Tracker and would like to support its development, consider making a donation. Your support helps keep the servers running and new features coming! Thank you so much for your support!
                        </p>
                        <a
                            href="https://buymeacoffee.com/traveltracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center no-underline"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Donate via Buy Me A Coffee
                        </a>

                        <form action="https://www.paypal.com/donate" method="post" target="_blank" className="mt-3">
                            <input type="hidden" name="business" value="P7WX5GF6ZQDXL" />
                            <input type="hidden" name="no_recurring" value="0" />
                            <input type="hidden" name="item_name" value="Your support helps keep the Travel Tracker servers running and new features coming! Thank you so much for your support!" />
                            <input type="hidden" name="currency_code" value="USD" />
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.493 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.875.812 5.216-.764 3.64-2.544 5.67-5.525 5.67h-1.55c-.297 0-.58.127-.756.405-.203.32-.236.702-.15 1.055l1.624 6.643c.092.378-.052.738-.427.738z" />
                                </svg>
                                Donate via PayPal
                            </button>
                            <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                        </form>
                    </div>

                    {/* Mobile Footer Links (only visible on small screens since main footer is hidden) */}
                    <div className="lg:hidden flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                        <a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</a>
                        <span>|</span>
                        <a href="/download" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download App
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
