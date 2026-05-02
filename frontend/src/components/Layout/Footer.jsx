import React from 'react';

const Footer = () => (
  <footer className="border-t border-slate-800 bg-slate-950 py-8 sm:py-12 text-center shadow-[0_-12px_40px_rgba(2,6,23,0.28)]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Platform</h3>
          <p className="text-xs text-slate-400">Connect with local shops instantly</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Support</h3>
          <p className="text-xs text-slate-400">help@near2door.local</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Follow</h3>
          <p className="text-xs text-slate-400">Social links coming soon</p>
        </div>
      </div>
      
      <div className="border-t border-slate-800 pt-6">
        <p className="text-xs sm:text-sm font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Near2Door. Hyperlocal speed, delivered.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
