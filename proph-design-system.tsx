# PROPH DESIGN SYSTEM - COMPONENT LIBRARY
## Complete Component Implementations

---

## TABLE OF CONTENTS

1. Common Components (Button, Badge, Card, Input)
2. Layout Components (Header, BottomNav, Modal)
3. Feature Components (PostingCard, PlayerCard, ApplicationCard, ApplyModal)
4. Page Components (PostingFeedPage, ApplicationsPage, ProfilePage)
5. Utility Helpers
6. TypeScript Types

---

## 1. COMMON COMPONENTS

### Button.tsx

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = true,
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold py-3 px-6 rounded-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-proph-yellow text-black hover:bg-[#E6D436]',
    secondary: 'border-2 border-proph-violet text-proph-text hover:bg-proph-violet/10',
    success: 'bg-proph-success text-white hover:bg-[#059669]',
    error: 'bg-proph-error text-white hover:bg-[#DC2626]',
    ghost: 'text-proph-blue hover:underline',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

---

### Badge.tsx

```typescript
import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 
  | 'great-fit' 
  | 'good-fit' 
  | 'possible-fit' 
  | 'pending' 
  | 'accepted' 
  | 'rejected'
  | 'active';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase';
  
  const variants = {
    'great-fit': 'bg-proph-yellow text-black',
    'good-fit': 'bg-proph-blue text-black',
    'possible-fit': 'bg-proph-violet text-white',
    'pending': 'bg-proph-yellow/20 text-proph-yellow border border-proph-yellow',
    'accepted': 'bg-proph-success/20 text-proph-success border border-proph-success',
    'rejected': 'bg-proph-error/20 text-proph-error border border-proph-error',
    'active': 'bg-proph-success text-white',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};
```

---

### Card.tsx

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className,
  hover = false,
  noPadding = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-proph-surface rounded-xl border border-proph-violet/20',
        !noPadding && 'p-4',
        hover && 'hover:border-proph-blue/40 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
```

---

### Input.tsx

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-proph-text mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full bg-proph-surface border rounded-lg px-4 py-3 text-proph-text placeholder-proph-violet',
          'focus:outline-none focus:ring-2 transition-all duration-150',
          error 
            ? 'border-proph-error focus:border-proph-error focus:ring-proph-error/20'
            : 'border-proph-violet/40 focus:border-proph-yellow focus:ring-proph-yellow/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-proph-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-proph-violet">{helperText}</p>
      )}
    </div>
  );
};
```

---

### Textarea.tsx

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  showCount,
  maxLength,
  value,
  className,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-proph-text mb-2">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full bg-proph-surface border rounded-lg px-4 py-3 text-proph-text placeholder-proph-violet resize-none',
          'focus:outline-none focus:ring-2 transition-all duration-150',
          error 
            ? 'border-proph-error focus:border-proph-error focus:ring-proph-error/20'
            : 'border-proph-violet/40 focus:border-proph-yellow focus:ring-proph-yellow/20',
          className
        )}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-sm text-proph-error">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-proph-violet">{helperText}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <p className="text-xs text-proph-violet">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
```

---

## 2. LAYOUT COMPONENTS

### Header.tsx

```typescript
import React from 'react';
import { Filter, Bell } from 'lucide-react';

interface HeaderProps {
  showFilter?: boolean;
  showNotifications?: boolean;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  showFilter = false,
  showNotifications = false,
  onFilterClick,
  onNotificationClick,
  notificationCount = 0,
}) => {
  return (
    <header className="sticky top-0 bg-proph-bg border-b border-proph-violet/20 px-4 py-3 flex justify-between items-center z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-proph-yellow">Proph</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="p-2 hover:bg-proph-surface rounded-lg transition-colors"
            aria-label="Filter postings"
          >
            <Filter className="w-6 h-6 text-proph-text" />
          </button>
        )}
        
        {showNotifications && (
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-proph-surface rounded-lg transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-6 h-6 text-proph-text" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-proph-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
```

---

### BottomNav.tsx

```typescript
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, User, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'feed', label: 'Feed', icon: Home, path: '/' },
  { id: 'applications', label: 'Applications', icon: FileText, path: '/applications' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'connections', label: 'Connections', icon: Users, path: '/connections' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-proph-bg border-t border-proph-violet/20 px-6 py-3 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            <Icon
              className={clsx(
                'w-6 h-6 transition-colors',
                isActive ? 'text-proph-yellow' : 'text-proph-violet'
              )}
            />
            <span
              className={clsx(
                'text-xs font-medium transition-colors',
                isActive ? 'text-proph-yellow' : 'text-proph-violet'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
```

---

### Modal.tsx

```typescript
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-h-[60vh]',
    md: 'max-h-[75vh]',
    lg: 'max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
      <div
        className={clsx(
          'w-full bg-proph-bg rounded-t-2xl overflow-y-auto',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-proph-bg border-b border-proph-violet/20 px-6 py-4 flex justify-between items-start">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-proph-text">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-proph-violet mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-proph-surface rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-proph-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
```

---

## 3. FEATURE COMPONENTS

### PostingCard.tsx

```typescript
import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Calendar, MapPin } from 'lucide-react';
import { Posting } from '../../types';
import { formatRelativeDate, isDeadlineUrgent, getMatchTier } from '../../utils/helpers';
import { clsx } from 'clsx';

interface PostingCardProps {
  posting: Posting;
  onApply: (postingId: string) => void;
  hasApplied?: boolean;
}

export const PostingCard: React.FC<PostingCardProps> = ({
  posting,
  onApply,
  hasApplied = false,
}) => {
  const isUrgent = isDeadlineUrgent(posting.deadline);
  const matchTier = posting.matchScore ? getMatchTier(posting.matchScore) : null;

  return (
    <Card hover className="space-y-4">
      {/* School Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {posting.school.logo && (
            <img
              src={posting.school.logo}
              alt={posting.school.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-bold text-proph-text">
              {posting.school.name}
            </h3>
            <p className="text-sm text-proph-violet">
              {posting.school.division}
            </p>
          </div>
        </div>
        {matchTier && (
          <Badge variant={matchTier}>
            {matchTier === 'great-fit' && 'Great Fit'}
            {matchTier === 'good-fit' && 'Good Fit'}
            {matchTier === 'possible-fit' && 'Possible Fit'}
          </Badge>
        )}
      </div>

      {/* Position */}
      <h4 className="text-xl font-bold text-proph-yellow">
        {posting.position}
      </h4>

      {/* Requirements */}
      <div className="space-y-2">
        {posting.requirements.height && (
          <div className="flex items-center gap-2 text-sm text-proph-violet">
            <span>Height:</span>
            <span className="text-proph-text">{posting.requirements.height}</span>
          </div>
        )}
        {posting.requirements.classYear && (
          <div className="flex items-center gap-2 text-sm text-proph-violet">
            <span>Class:</span>
            <span className="text-proph-text">{posting.requirements.classYear}</span>
          </div>
        )}
        {posting.requirements.gpa && (
          <div className="flex items-center gap-2 text-sm text-proph-violet">
            <span>GPA:</span>
            <span className="text-proph-text">{posting.requirements.gpa}</span>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span
            className={clsx(
              'flex items-center gap-1',
              isUrgent ? 'text-proph-error' : 'text-proph-violet'
            )}
          >
            <Calendar className="w-4 h-4" />
            Apply by {new Date(posting.deadline).toLocaleDateString()}
          </span>
          <span className="text-proph-violet">
            {posting.applicantCount} players applied
          </span>
        </div>
      </div>

      {/* CTA */}
      {hasApplied ? (
        <Button variant="secondary" disabled>
          Already Applied
        </Button>
      ) : (
        <Button variant="primary" onClick={() => onApply(posting.id)}>
          Apply Now
        </Button>
      )}
    </Card>
  );
};
```

---

### PlayerCard.tsx

```typescript
import React from 'react';
import { Card } from '../common/Card';
import { PlayerProfile } from '../../types';
import { clsx } from 'clsx';

interface PlayerCardProps {
  player: PlayerProfile;
  scale?: number; // 0.6 for preview, 1 for full size
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  scale = 1,
  className,
}) => {
  return (
    <Card
      noPadding
      className={clsx(
        'border-2 border-proph-yellow shadow-lg shadow-proph-yellow/10 overflow-hidden',
        className
      )}
      style={{ transform: `scale(${scale})` }}
    >
      <div className="bg-gradient-to-br from-proph-surface to-proph-bg p-6 space-y-4">
        {/* Header Label */}
        <div className="text-right">
          <span className="text-xs text-proph-violet italic">Throwback Collection</span>
        </div>

        {/* Player Photo */}
        <div className="flex justify-center">
          <img
            src={player.photo}
            alt={player.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-proph-yellow"
          />
        </div>

        {/* Player Name & Position */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-proph-text">
            {player.name}
          </h2>
          <p className="text-lg font-semibold text-proph-yellow">
            {player.position}
          </p>
        </div>

        {/* Player Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-proph-violet">School</p>
            <p className="text-proph-text font-medium">{player.school}</p>
          </div>
          <div>
            <p className="text-proph-violet">Height • Age</p>
            <p className="text-proph-text font-medium">
              {player.height} • {player.age}
            </p>
          </div>
          <div>
            <p className="text-proph-violet">Class of</p>
            <p className="text-proph-text font-medium">{player.classYear}</p>
          </div>
          <div>
            <p className="text-proph-violet">Location</p>
            <p className="text-proph-text font-medium">{player.location}</p>
          </div>
        </div>

        {/* Proph Evaluation */}
        <div className="bg-proph-yellow/20 border border-proph-yellow rounded-lg p-4 text-center">
          <p className="text-xs text-proph-yellow font-semibold uppercase mb-1">
            Your Proph
          </p>
          <p className="text-lg font-bold text-proph-yellow">
            {player.evaluation.level}
          </p>
        </div>

        {/* Shades Of (Player Comparisons) */}
        <div className="space-y-2">
          <p className="text-xs text-proph-violet uppercase font-semibold">
            Shades Of
          </p>
          <div className="space-y-1">
            {player.evaluation.comparisons.map((comp, idx) => (
              <p key={idx} className="text-sm text-proph-text">
                • {comp}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-proph-violet/20">
          <span className="text-sm font-bold text-proph-yellow">Proph</span>
          <span className="text-xs text-proph-violet italic">Click to flip</span>
        </div>
      </div>
    </Card>
  );
};
```

---

### ApplicationCard.tsx

```typescript
import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Application } from '../../types';
import { formatRelativeDate } from '../../utils/helpers';

interface ApplicationCardProps {
  application: Application;
  onViewPosting?: (postingId: string) => void;
  onMessageCoach?: (coachId: string) => void;
  onWithdraw?: (applicationId: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewPosting,
  onMessageCoach,
  onWithdraw,
}) => {
  const { posting, status, appliedAt } = application;

  return (
    <Card className="space-y-4">
      {/* School Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {posting.school.logo && (
            <img
              src={posting.school.logo}
              alt={posting.school.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-bold text-proph-text">
              {posting.school.name}
            </h3>
            <p className="text-sm text-proph-violet">{posting.position}</p>
          </div>
        </div>
        <Badge variant={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-proph-violet">
        <span>Applied {formatRelativeDate(appliedAt)}</span>
        {status === 'pending' && posting.applicantCount && (
          <span>{posting.applicantCount} other applicants</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {status === 'pending' && (
          <>
            {onViewPosting && (
              <Button
                variant="secondary"
                onClick={() => onViewPosting(posting.id)}
              >
                View Posting
              </Button>
            )}
            {onWithdraw && (
              <Button
                variant="ghost"
                fullWidth={false}
                onClick={() => onWithdraw(application.id)}
                className="text-proph-error hover:text-proph-error/80"
              >
                Withdraw
              </Button>
            )}
          </>
        )}

        {status === 'accepted' && (
          <>
            {onMessageCoach && (
              <Button
                variant="success"
                onClick={() => onMessageCoach(posting.coachName)}
              >
                Message Coach
              </Button>
            )}
            {onViewPosting && (
              <Button
                variant="secondary"
                fullWidth={false}
                onClick={() => onViewPosting(posting.id)}
              >
                View Profile
              </Button>
            )}
          </>
        )}

        {status === 'rejected' && onViewPosting && (
          <Button
            variant="secondary"
            onClick={() => onViewPosting(posting.id)}
          >
            View Posting
          </Button>
        )}
      </div>
    </Card>
  );
};
```

---

### ApplyModal.tsx

```typescript
import React, { useState } from 'react';
import { Modal } from '../layout/Modal';
import { PlayerCard } from './PlayerCard';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { Posting, PlayerProfile } from '../../types';
import { CheckCircle } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  posting: Posting;
  player: PlayerProfile;
  onSubmit: (note?: string) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  posting,
  player,
  onSubmit,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(note || undefined);
      onClose();
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${posting.school.name}`}
      subtitle={`${posting.position} • ${posting.school.division}`}
    >
      <div className="space-y-6">
        {/* Player Card Preview */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <PlayerCard player={player} scale={0.6} />
          </div>
          <p className="text-center text-xs text-proph-violet">
            This is what Coach {posting.coachName} will see
          </p>
        </div>

        {/* Optional Note */}
        <div className="space-y-2">
          <Textarea
            label="Add a note (optional)"
            placeholder="Why are you interested in this program?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={150}
            showCount
            helperText="Coaches are 2x more likely to accept applications with a personal note"
            rows={4}
          />
        </div>

        {/* Application Summary */}
        <div className="bg-proph-surface border border-proph-violet/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-proph-violet font-medium">
            Your application includes:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Player profile
            </div>
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Stats & highlights
            </div>
            <div className="flex items-center gap-2 text-sm text-proph-text">
              <CheckCircle className="w-4 h-4 text-proph-success" />
              Proph evaluation ({player.evaluation.level})
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Application
          </Button>
          <p className="text-center text-xs text-proph-violet">
            You can track this in your Applications tab
          </p>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 4. PAGE COMPONENTS

### PostingFeedPage.tsx

```typescript
import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { PostingCard } from '../components/posting/PostingCard';
import { ApplyModal } from '../components/posting/ApplyModal';
import { Posting, PlayerProfile } from '../types';

// Mock data - replace with API calls
const mockPostings: Posting[] = [
  // ... your posting data
];

const mockPlayer: PlayerProfile = {
  // ... your player data
};

export const PostingFeedPage: React.FC = () => {
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [appliedPostings, setAppliedPostings] = useState<Set<string>>(new Set());

  const handleApply = (postingId: string) => {
    const posting = mockPostings.find((p) => p.id === postingId);
    if (posting) {
      setSelectedPosting(posting);
    }
  };

  const handleSubmitApplication = async (note?: string) => {
    if (selectedPosting) {
      // TODO: Call API to submit application
      console.log('Submitting application:', {
        postingId: selectedPosting.id,
        note,
      });
      
      setAppliedPostings((prev) => new Set(prev).add(selectedPosting.id));
      
      // Show success toast
      // TODO: Implement toast notification
    }
  };

  return (
    <div className="min-h-screen bg-proph-bg pb-20">
      <Header showFilter showNotifications notificationCount={3} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-proph-text">
            Postings For You
          </h1>
          <p className="text-sm text-proph-violet mt-1">
            Based on your {mockPlayer.evaluation.level} projection
          </p>
        </div>

        {/* Posting Feed */}
        <div className="space-y-4">
          {mockPostings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">No postings right now</p>
              <p className="text-sm text-proph-violet">
                We'll notify you when new ones arrive
              </p>
            </div>
          ) : (
            mockPostings.map((posting) => (
              <PostingCard
                key={posting.id}
                posting={posting}
                onApply={handleApply}
                hasApplied={appliedPostings.has(posting.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedPosting && (
        <ApplyModal
          isOpen={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          posting={selectedPosting}
          player={mockPlayer}
          onSubmit={handleSubmitApplication}
        />
      )}

      <BottomNav />
    </div>
  );
};
```

---

### ApplicationsPage.tsx

```typescript
import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { ApplicationCard } from '../components/application/ApplicationCard';
import { Application } from '../types';
import { clsx } from 'clsx';

type TabType = 'pending' | 'accepted' | 'rejected';

// Mock data - replace with API calls
const mockApplications: Application[] = [
  // ... your application data
];

export const ApplicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const filteredApplications = mockApplications.filter(
    (app) => app.status === activeTab
  );

  const getTabCount = (status: TabType) => {
    return mockApplications.filter((app) => app.status === status).length;
  };

  return (
    <div className="min-h-screen bg-proph-bg pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-proph-text">My Applications</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-proph-violet/20">
          {(['pending', 'accepted', 'rejected'] as TabType[]).map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex-1 py-3 font-semibold text-sm uppercase transition-colors',
                  'border-b-2',
                  isActive
                    ? 'text-proph-yellow border-proph-yellow'
                    : 'text-proph-violet border-transparent hover:text-proph-text'
                )}
              >
                {tab} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Application List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">
                No {activeTab} applications
              </p>
              {activeTab === 'pending' && (
                <p className="text-sm text-proph-violet">
                  Start browsing postings to apply!
                </p>
              )}
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewPosting={(id) => console.log('View posting:', id)}
                onMessageCoach={(id) => console.log('Message coach:', id)}
                onWithdraw={(id) => console.log('Withdraw:', id)}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
```

---

### ProfilePage.tsx

```typescript
import React from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { PlayerCard } from '../components/player/PlayerCard';
import { Button } from '../components/common/Button';
import { Share2, Camera, Edit } from 'lucide-react';
import { PlayerProfile } from '../types';

// Mock data - replace with API call
const mockPlayer: PlayerProfile = {
  // ... your player data
};

export const ProfilePage: React.FC = () => {
  const handleShare = () => {
    // Generate shareable link
    const link = `https://proph.com/p/${mockPlayer.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${mockPlayer.name} - Proph Profile`,
        url: link,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-proph-bg pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Player Card */}
        <div className="flex justify-center">
          <PlayerCard player={mockPlayer} />
        </div>

        {/* Share Button */}
        <Button variant="primary" onClick={handleShare}>
          <span className="flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share My Proph
          </span>
        </Button>

        {/* Profile Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-proph-text">
            Profile Settings
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-proph-surface border border-proph-violet/20 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-proph-blue/40 transition-colors">
              <Camera className="w-6 h-6 text-proph-yellow" />
              <span className="text-sm font-semibold text-proph-text">
                Update Photo
              </span>
            </button>

            <button className="bg-proph-surface border border-proph-violet/20 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-proph-blue/40 transition-colors">
              <Edit className="w-6 h-6 text-proph-yellow" />
              <span className="text-sm font-semibold text-proph-text">
                Edit Profile
              </span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
```

---

## 5. UTILITY HELPERS

### helpers.ts

```typescript
/**
 * Format date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Check if deadline is within 7 days (urgent)
 */
export function isDeadlineUrgent(deadline: string): boolean {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
}

/**
 * Convert match score (0-100) to tier
 */
export function getMatchTier(score: number): 'great-fit' | 'good-fit' | 'possible-fit' {
  if (score >= 80) return 'great-fit';
  if (score >= 60) return 'good-fit';
  return 'possible-fit';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format height from inches to feet'inches" format
 */
export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

/**
 * Generate unique shareable link for player
 */
export function generateShareLink(playerId: string): string {
  return `https://proph.com/p/${playerId}`;
}
```

---

## 6. TYPESCRIPT TYPES

### types/index.ts

```typescript
export type Division = 'D1' | 'D2' | 'D3' | 'NAIA';

export interface School {
  id: string;
  name: string;
  logo: string;
  division: Division;
  location: string;
  conference?: string;
}

export interface Posting {
  id: string;
  school: School;
  position: string;
  requirements: {
    height?: string;
    classYear?: number;
    gpa?: number;
  };
  deadline: string;
  applicantCount: number;
  matchScore?: number;
  description: string;
  coachName: string;
  createdAt: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  position: string;
  photo: string;
  school: string;
  height: string;
  weight?: number;
  age: number;
  location: string;
  classYear: number;
  evaluation: {
    level: string;
    comparisons: string[];
  };
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    fgPercentage: number;
    threePtPercentage: number;
    steals: number;
    blocks: number;
  };
}

export interface Application {
  id: string;
  posting: Posting;
  player: PlayerProfile;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  note?: string;
}

export interface Connection {
  id: string;
  coach: {
    id: string;
    name: string;
    school: School;
    position: string;
    photo?: string;
  };
  player: PlayerProfile;
  connectedAt: string;
}

export interface Coach {
  id: string;
  name: string;
  school: School;
  position: string;
  photo?: string;
  email?: string;
  verified: boolean;
}
```

---

## USAGE EXAMPLES

### Example: Using Button Component

```typescript
import { Button } from './components/common/Button';

// Primary action
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Secondary action
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Loading state
<Button variant="primary" isLoading>
  Submitting...
</Button>

// Half width
<Button variant="success" fullWidth={false}>
  Accept
</Button>
```

### Example: Using Badge Component

```typescript
import { Badge } from './components/common/Badge';

<Badge variant="great-fit">Great Fit</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="accepted">Accepted</Badge>
```

### Example: Using Modal Component

```typescript
import { Modal } from './components/layout/Modal';
import { Button } from './components/common/Button';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Application"
  subtitle="Are you sure you want to apply?"
>
  <div className="space-y-4">
    <p>This action cannot be undone.</p>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

---

END OF DESIGN SYSTEM FILE