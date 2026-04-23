import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const LogoPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const bg = (searchParams.get('bg') || 'black').toLowerCase();
  const mono = searchParams.get('mono') === 'true';

  const backgroundClass =
    bg === 'yellow' ? 'bg-proph-yellow' : bg === 'white' ? 'bg-proph-white' : 'bg-proph-black';

  const textClass = mono
    ? bg === 'yellow' || bg === 'white'
      ? 'text-proph-black'
      : 'text-proph-white'
    : bg === 'yellow'
      ? 'text-proph-black'
      : 'text-proph-yellow';

  // Glow is intentionally disabled for brand consistency across all logo surfaces.
  const shadowStyle = 'none';

  return (
    <main className={`min-h-screen ${backgroundClass} flex items-center justify-center px-4`}>
      <h1
        className={`text-[clamp(5rem,22vw,18rem)] leading-none font-extrabold ${textClass} select-all`}
        style={{ textShadow: shadowStyle, letterSpacing: '-0.02em' }}
      >
        Proph
      </h1>
    </main>
  );
};

export default LogoPage;
