/**
 * Message utility functions for formatting timestamps
 */

// For conversation list (e.g., "2h ago", "Yesterday", "Mar 15")
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// For message bubbles (e.g., "2:30 PM")
export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Check if timestamp should be shown
export const shouldShowTimestamp = (
  currentMsg: { timestamp: string },
  previousMsg?: { timestamp: string },
): boolean => {
  if (!previousMsg) return true;
  const diffMinutes = (new Date(currentMsg.timestamp).getTime() - new Date(previousMsg.timestamp).getTime()) / 60000;
  return diffMinutes > 5;
};

