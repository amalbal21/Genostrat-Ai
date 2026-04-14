import React from 'react';

export default function TeamSection() {
  return (
    <section className="relative w-full bg-[#FFFFFF] text-[#1F1F1F] font-sans overflow-hidden border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      {/* 
        Container for the top section (Header) and the Hero text. 
        Calculated height to sit naturally below the main dashboard.
      */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-32 flex flex-col min-h-[60vh] md:min-h-[70vh]">
        
        {/* Header Row */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-12 mb-auto">
          {/* Top Left */}
          <div className="w-full md:w-1/3">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight" style={{ fontFamily: "'Inter', 'Geist', 'Outfit', sans-serif" }}>
              Innovating the Future
            </h2>
          </div>

          {/* Top Right */}
          <div className="w-full md:w-auto flex flex-row gap-16 md:gap-24 text-sm font-medium tracking-wide">
            {/* Group 1 */}
            <ul className="flex flex-col gap-3" style={{ color: 'rgba(31,31,31,0.85)' }}>
              <li><a href="#" className="hover:text-black transition-colors">About</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Projects</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Stack</a></li>
              <li><a href="#" className="hover:text-black transition-colors">GitHub</a></li>
            </ul>

            {/* Group 2 */}
            <ul className="flex flex-col gap-3" style={{ color: 'rgba(31,31,31,0.85)' }}>
              <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>
        </header>

        {/* Center/Bottom Hero Text */}
        <div className="w-full mt-24 md:mt-auto flex items-end">
          <h1 
            className="font-bold tracking-tighter leading-none select-none"
            style={{ 
              fontFamily: "'Inter', 'Geist', 'Jost', sans-serif",
              fontSize: 'clamp(5rem, 16vw, 15.5rem)', 
              marginLeft: '-0.07em' // Negative left margin to align the 'T' perfectly
            }}
          >
            Techvengers
          </h1>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="w-full border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wide" style={{ color: 'rgba(31,31,31,0.7)' }}>
          <div>
            &copy; {new Date().getFullYear()} Techvengers
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </section>
  );
}
