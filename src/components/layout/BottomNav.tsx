import React from 'react';
import { Home, FileText, MessageCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUnreadCount } from '../../hooks';

interface BottomNavProps {
  hasApplicationUpdate?: boolean;
  hasProfileUpdate?: boolean;
  profilePhoto?: string; // Optional - will use localStorage if not provided
}

// Helper to get profile photo from localStorage with fallback
const getProfilePhoto = (propPhoto?: string): string => {
  if (propPhoto) return propPhoto;
  const stored = localStorage.getItem('profilePhoto');
  if (stored) return stored;
  return '/defualt.webp'; // Fallback to default image
};

export const BottomNav: React.FC<BottomNavProps> = ({
  hasApplicationUpdate = false,
  hasProfileUpdate = false,
  profilePhoto: propPhoto,
}) => {
  const profilePhoto = getProfilePhoto(propPhoto);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadCount();
  
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path === '/player/home') return 'home';
    if (path === '/player/postings') return 'postings';
    if (path === '/player/applications') return 'applications';
    if (path === '/player/messages') return 'recruit';
    if (path === '/player/profile') return 'profile';
    return 'home';
  };

  const active = getActiveTab();

  const handleTabClick = (tab: string, path: string) => {
    if (active === tab) {
      // Scroll to top if already active
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-proph-black border-t border-proph-grey-text/5 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="h-12 px-2 flex items-center justify-around py-1">
        
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home', '/player/home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
            active === 'home' ? 'text-proph-yellow' : 'text-proph-grey-text'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${active === 'home' ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Postings Tab */}
        <button
          onClick={() => handleTabClick('postings', '/player/postings')}
          className={`flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
            active === 'postings' ? 'text-proph-yellow' : 'text-proph-grey-text'
          }`}
          aria-label="Postings"
        >
          <FileText className={`w-5 h-5 ${active === 'postings' ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Postings</span>
        </button>

        {/* Applications Tab */}
        <button
          onClick={() => handleTabClick('applications', '/player/applications')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
            active === 'applications' ? 'text-proph-yellow' : 'text-proph-grey-text'
          }`}
          aria-label={`Applications${hasApplicationUpdate ? ', new activity' : ''}`}
        >
          <div className="relative">
            <FileText className={`w-5 h-5 ${active === 'applications' ? 'fill-current' : ''}`} />
            
            {/* Yellow Dot Indicator - Status Updates Only */}
            {hasApplicationUpdate && (
              <span 
                className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-proph-yellow rounded-full ring-2 ring-proph-black animate-pulse"
                style={{ animationDuration: '2s', animationIterationCount: '3' }}
              />
            )}
          </div>
          <span className="text-xs font-medium">Apps</span>
        </button>

        {/* Recruit Tab */}
        <button
          onClick={() => handleTabClick('recruit', '/player/messages')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
            active === 'recruit' ? 'text-proph-yellow' : 'text-proph-grey-text'
          }`}
          aria-label={`Recruit${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${active === 'recruit' ? 'fill-current' : ''}`} />
            {/* Yellow notification dot for unread messages */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-proph-yellow rounded-full ring-2 ring-proph-black" />
            )}
          </div>
          <span className="text-xs font-medium">Recruit</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile', '/player/profile')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
            active === 'profile' ? 'text-proph-yellow' : 'text-proph-grey-text'
          }`}
          aria-label="Profile"
        >
          <div className="relative">
            <img 
              src={profilePhoto} 
              alt="Profile" 
              className={`w-5 h-5 rounded-full object-cover ${
                active === 'profile' ? 'ring-2 ring-proph-yellow' : 'ring-1 ring-proph-grey-text/30'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/defualt.webp';
              }}
            />
            
            {/* Yellow Dot Indicator - Action Required */}
            {hasProfileUpdate && (
              <span 
                className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-proph-yellow rounded-full ring-2 ring-proph-black animate-pulse"
                style={{ animationDuration: '2s', animationIterationCount: '3' }}
              />
            )}
          </div>
          <span className="text-xs font-medium">Profile</span>
        </button>

      </div>
    </nav>
  );
};
