import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const LogoPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const bg = (searchParams.get('bg') || 'black').toLowerCase();
  const mono = searchParams.get('mono') === 'true';
  const shadow = (searchParams.get('shadow') || 'on').toLowerCase();

  const backgroundClass =
    bg === 'yellow' ? 'bg-proph-yellow' : bg === 'white' ? 'bg-proph-white' : 'bg-proph-black';

  const textClass = mono
    ? bg === 'yellow' || bg === 'white'
      ? 'text-proph-black'
      : 'text-proph-white'
    : bg === 'yellow'
      ? 'text-proph-black'
      : 'text-proph-yellow';

  const shadowStyle =
    shadow === 'off'
      ? 'none'
      : textClass === 'text-proph-yellow'
        ? '0 0 28px rgba(255, 236, 60, 0.5)'
        : textClass === 'text-proph-white'
          ? '0 0 28px rgba(255, 255, 255, 0.35)'
          : '0 0 28px rgba(10, 10, 10, 0.3)';

  return (
    <main className={`min-h-screen ${backgroundClass} flex items-center justify-center px-4`}>
      <h1
        className={`text-[clamp(5rem,22vw,18rem)] leading-none font-extrabold ${textClass} select-all`}
        style={{ textShadow: shadowStyle, letterSpacing: '-10px' }}
      >
        Proph
      </h1>
    </main>
  );
};

export default LogoPage;
