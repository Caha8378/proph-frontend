import React from 'react';

export const LogoPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-proph-black flex items-center justify-center px-4">
      <h1
        className="text-[clamp(5rem,22vw,18rem)] leading-none font-extrabold text-proph-yellow select-all"
        style={{ textShadow: '0 0 28px rgba(255, 236, 60, 0.5)', letterSpacing: '-10px' }}
      >
        Proph
      </h1>
    </main>
  );
};

export default LogoPage;
