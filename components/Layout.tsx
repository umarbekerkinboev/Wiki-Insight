
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Built with React & Gemini AI • Inspired by Wikipedia</p>
      </footer>
    </div>
  );
};

export default Layout;
