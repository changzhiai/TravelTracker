import { useEffect } from "react";
import QRCode from "react-qr-code";
import logoImage from "../assets/logo_tt.png";

export function DownloadApp() {
  useEffect(() => {
    const root = document.getElementById('root');
    const originalBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      height: document.body.style.height,
      overscrollBehavior: document.body.style.overscrollBehavior
    };
    
    const originalHtmlStyles = {
      overflow: document.documentElement.style.overflow,
      height: document.documentElement.style.height,
      overscrollBehavior: document.documentElement.style.overscrollBehavior
    };

    const originalRootStyles = {
      height: root?.style.height,
      overflow: root?.style.overflow
    };
    
    // Enable scrolling
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
    document.body.style.overscrollBehavior = 'auto';
    
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.documentElement.style.overscrollBehavior = 'auto';

    if (root) {
      root.style.height = 'auto';
      root.style.overflow = 'auto';
    }
    
    return () => {
      // Restore global app-mode styles
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.position = originalBodyStyles.position;
      document.body.style.height = originalBodyStyles.height;
      document.body.style.overscrollBehavior = originalBodyStyles.overscrollBehavior;
      
      document.documentElement.style.overflow = originalHtmlStyles.overflow;
      document.documentElement.style.height = originalHtmlStyles.height;
      document.documentElement.style.overscrollBehavior = originalHtmlStyles.overscrollBehavior;

      if (root) {
        root.style.height = originalRootStyles.height || '';
        root.style.overflow = originalRootStyles.overflow || '';
      }
    };
  }, []);

  const iosLink = "https://apps.apple.com/il/app/travel-tracker-visited-maps/id6758506116"; 
  const androidLink = "https://play.google.com/store/apps/details?id=com.traveltracker.app";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 flex flex-col items-center justify-start px-2 py-8 sm:p-12 font-sans overflow-x-hidden">
      

      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-2xl border border-white max-lg:mt-6 rounded-[2rem] shadow-2xl p-4 sm:p-12 text-center md:container relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center mb-6 sm:mb-10">
          <img src={logoImage} alt="Travel Tracker Logo" className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 object-contain drop-shadow-md" />
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight">
            Take Travel Tracker Anywhere
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Download our mobile app to track your visited countries, states, and national parks offline. 
            Enjoy a native, seamlessly synchronized experience on your favorite device.
          </p>
        </div>

        {/* QR Codes Grid */}
        <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto">
          
          {/* iOS Card */}
          <div className="group bg-white p-5 sm:p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
               <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13.12 4.22c.76-.92 1.27-2.2.14-3.48-1.09.24-2.47 1.09-3.28 2.02-.75.89-1.31 2.22-.17 3.47 1.22-.29 2.54-1.08 3.31-2.01z"/></svg>
               iOS App
            </h2>
            <div className="bg-white p-3 rounded-2xl border-4 border-gray-50 shadow-inner mb-6 group-hover:scale-105 transition-transform duration-300">
              <QRCode 
                value={iosLink} 
                size={180}
                fgColor="#3730a3" 
                bgColor="#ffffff"
              />
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">Scan to view on the App Store</p>
            <a 
              href={iosLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-black text-white hover:bg-gray-800 py-3.5 px-6 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Download on App Store
            </a>
          </div>

          {/* Android Card */}
          <div className="group bg-white p-5 sm:p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
               <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.0551 0-.1092-.0204-.1492-.0604-.0401-.0401-.0604-.0943-.0604-.1496v-10.453c0-.0552.0203-.1095.0604-.1495.04-.0401.0941-.0605.1492-.0605h.5828c.0551 0 .1092.0204.1493.0605.04.04.0604.0943.0604.1495v10.453c0 .0553-.0204.1095-.0604.1496-.0401.04-.0942.0604-.1493.0604h-.5828zm-2.059-3.4151h-6.9279v-2.7303h6.9279v2.7303zm-7.5108 3.4151c-.0551 0-.1092-.0204-.1493-.0604-.04-.0401-.0604-.0943-.0604-.1496v-10.453c0-.0552.0204-.1095.0604-.1495.0401-.0401.0942-.0605.1493-.0605h.5828c.0551 0 .1092.0204.1492.0605.0401.04.0605.0943.0605.1495v10.453c0 .0553-.0204.1095-.0605.1496-.04-.04-.0941.0604-.1492.0604h-.5828zm3.7554-15.3414h-.5828c-.0551 0-.1092.0203-.1492.0604v2.7303h1.4641v-2.7303c0-.0401-.0401-.0604-.0943-.0604h-.6378zm.892 0h-2.3668c-.0552 0-.1092.0203-.1492.0604v2.7303h4.1352v-2.7303c0-.0401-.0401-.0604-.0944-.0604h-1.5248zM12.0001 24c-6.617 0-12-5.383-12-12s5.383-12 12-12 12 5.383 12 12-5.383 12-12 12zm0-22c-5.514 0-10 4.486-10 10s4.486 10 10 10 10-4.486 10-10-4.486-10-10-10zm2.75 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm-5.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/></svg>
               Android App
            </h2>
            <div className="bg-white p-3 rounded-2xl border-4 border-gray-50 shadow-inner mb-6 group-hover:scale-105 transition-transform duration-300">
              <QRCode 
                value={androidLink} 
                size={180}
                fgColor="#059669" 
                bgColor="#ffffff"
              />
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">Scan to view on Google Play</p>
            <a 
              href={androidLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3.5 px-6 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              Get it on Google Play
            </a>
          </div>

        </div>

      </div>
      
      {/* Footer Return Action */}
      <div className="mt-8 sm:mt-12 relative z-10">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white/60 text-indigo-700 backdrop-blur-md border border-white/50 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-lg hover:bg-white transition-all active:scale-95"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>

    </div>
  );
}
