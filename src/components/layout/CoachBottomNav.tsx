import React from 'react';
import { Home, Pencil, ClipboardList, Users, MessageCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUnreadCount } from '../../hooks';

interface CoachBottomNavProps {
  postingsCount?: number;
  pendingAppsCount?: number;
  teamCount?: number;
  unreadMessagesCount?: number; // Optional override, otherwise uses hook
  isVerified?: boolean; // Whether the coach account is verified
}

// Helper to get school logo from localStorage (for "My Team" icon)
const getSchoolLogo = (): string | null => {
  return localStorage.getItem('schoolLogo');
};

// Helper to get pending count from localStorage
const getPendingCountFromStorage = (): number => {
  try {
    const cached = localStorage.getItem('applicationInfo');
    if (cached) {
      const data = JSON.parse(cached);
      return data.pending_count || 0;
    }
  } catch {
    // Ignore parse errors
  }
  return 0;
};

export const CoachBottomNav: React.FC<CoachBottomNavProps> = ({
  postingsCount = 0,
  pendingAppsCount,
  teamCount = 0,
  unreadMessagesCount: unreadMessagesCountProp,
  isVerified = true, // Default to true if not provided (for backward compatibility)
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadCount();
  
  // Use prop if provided, otherwise use hook value
  const actualUnreadCount = unreadMessagesCountProp !== undefined 
    ? unreadMessagesCountProp 
    : unreadCount;
  
  // Use prop if provided, otherwise read from localStorage
  const actualPendingCount = pendingAppsCount !== undefined 
    ? pendingAppsCount 
    : getPendingCountFromStorage();

  const getActive = () => {
    const p = location.pathname;
    if (p.startsWith('/coach/home')) return 'home';
    if (p.startsWith('/coach/postings')) return 'postings';
    if (p.startsWith('/coach/applications')) return 'applications';
    if (p.startsWith('/coach/messages')) return 'recruit';
    if (p.startsWith('/coach/team')) return 'team';
    return '';
  };
  const active = getActive();

  const Tab = ({
    id,
    label,
    icon: Icon,
    to,
    badge,
    useImageIcon,
    disabled,
  }: { 
    id: string; 
    label: string; 
    icon: any; 
    to: string; 
    badge?: number;
    useImageIcon?: boolean;
    disabled?: boolean;
  }) => {
    const schoolLogo = useImageIcon ? getSchoolLogo() : null;
    
    return (
      <button
        onClick={() => {
          if (disabled) {
            alert('Your account is pending verification. You\'ll be able to access this feature once approved.');
            return;
          }
          if (active === id) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            navigate(to);
          }
        }}
        disabled={disabled}
        className={`relative flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-colors duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed text-proph-grey-text'
            : active === id 
              ? 'text-proph-yellow' 
              : 'text-proph-grey-text'
        }`}
        aria-label={label}
      >
        <div className="relative">
          {useImageIcon && schoolLogo ? (
            <div className="w-5 h-5 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center">
              <img
                src={schoolLogo}
                alt="Team"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  // Fallback to icon if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                  const iconElement = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                  if (iconElement) iconElement.style.display = 'block';
                }}
              />
              <Icon className={`w-5 h-5 ${active === id ? 'fill-current' : ''} hidden`} />
            </div>
          ) : (
            <Icon className={`w-5 h-5 ${active === id ? 'fill-current' : ''}`} />
          )}
          {/* Yellow notification dot for pending applications */}
          {id === 'applications' && badge !== undefined && badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-proph-yellow rounded-full ring-2 ring-proph-black" />
          )}
          {/* Yellow notification dot for unread messages (Recruit tab) */}
          {id === 'recruit' && actualUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-proph-yellow rounded-full ring-2 ring-proph-black" />
          )}
          {/* Badge count (for other tabs) */}
          {id !== 'applications' && id !== 'recruit' && badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[18px] h-4 px-1 bg-proph-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-proph-black">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-proph-black border-t border-proph-grey-text/5 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="h-14 px-2 flex items-center justify-around">
        <Tab id="home" label="Home" icon={Home} to="/coach/home" />
        <Tab id="postings" label="Postings" icon={Pencil} to="/coach/postings" badge={postingsCount} disabled={!isVerified} />
        <Tab id="applications" label="Applications" icon={ClipboardList} to="/coach/applications" badge={actualPendingCount} disabled={!isVerified} />
        <Tab id="recruit" label="Recruit" icon={MessageCircle} to="/coach/messages" disabled={!isVerified} />
        <Tab id="team" label="My Team" icon={Users} to="/coach/team" badge={teamCount} useImageIcon={true} />
      </div>
    </nav>
  );
};


