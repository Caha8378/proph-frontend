import React, { useState, useEffect, useRef } from 'react';
import { Bell, Edit, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

interface HeaderProps {
  notificationCount?: number;
  onEditClick?: () => void;
  showEditButton?: boolean; // Optional override
}

export const Header: React.FC<HeaderProps> = ({
  notificationCount = 0,
  onEditClick,
  showEditButton,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Get current user and logout function from context
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const logoutDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutDropdownRef.current &&
        !logoutDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLogoutDropdown(false);
      }
    };

    if (showLogoutDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLogoutDropdown]);

  // Determine logo destination based on user role
  const getLogoDestination = () => {
    if (!user) return '/'; // Not logged in → Landing page
    
    switch (user.role) {
      case 'player':
        return '/player/home';
      case 'coach':
        return '/coach/home';
      case 'supporter':
        return '/supporter/home';
      default:
        return '/';
    }
  };

  const handleLogoClick = () => {
    const destination = getLogoDestination();
    navigate(destination);
  };

  const handleLogoutClick = () => {
    logout();
    setShowLogoutDropdown(false);
    navigate('/'); // Redirect to landing page
  };

  // Auto-detect if we're on a profile page (unless overridden)
  const isProfilePage = showEditButton !== undefined 
    ? showEditButton 
    : location.pathname.includes('/profile');

  return (
    <header className="sticky top-0 z-50 bg-proph-black border-b border-proph-grey-text/20">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left: Logo + Edit (if profile) */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="active:scale-95 transition-transform"
            aria-label="Go to home"
          >
            <h1 
              className="text-xl font-extrabold text-proph-yellow"
              style={{ 
                textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                letterSpacing: '-2px'
              }}
            >
              Proph
            </h1>
          </button>

          {/* Edit Icon (Profile pages only) */}
          {isProfilePage && onEditClick && (
            <button
              onClick={onEditClick}
              className="p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
              aria-label="Edit profile"
            >
              <Edit className="w-5 h-5 text-proph-white" />
            </button>
          )}
        </div>

        {/* Right: Notification Bell + Logout */}
        <div className="flex items-center gap-2">
          {/* Notification Bell - Only show if user is logged in */}
          {user && (
            <button
              className="relative p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            >
              <Bell className="w-5 h-5 text-proph-white" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-proph-error rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Logout Dropdown - Only show if user is logged in */}
          {user && (
            <div className="relative" ref={logoutDropdownRef}>
              {/* Logout Icon Button - Opens dropdown */}
              <button
                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                className="p-2 hover:bg-proph-grey-light rounded-lg transition-colors flex items-center gap-1"
                aria-label="Account menu"
                aria-expanded={showLogoutDropdown}
              >
                <LogOut className="w-5 h-5 text-proph-white" />
                <ChevronDown 
                  className={`w-4 h-4 text-proph-grey-text transition-transform ${showLogoutDropdown ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showLogoutDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-proph-grey border border-proph-grey-text/20 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-50">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2.5 text-left text-proph-white hover:bg-proph-grey-light transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};