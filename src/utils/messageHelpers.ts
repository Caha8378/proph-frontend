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
  currentMsg: { timestamp: string; senderId?: string },
  previousMsg?: { timestamp: string; senderId?: string },
): boolean => {
  // Always show timestamp for first message
  if (!previousMsg) return true;
  
  // Show timestamp if messages are from different senders
  // (This helps distinguish who sent what)
  if (currentMsg.senderId && previousMsg.senderId && currentMsg.senderId !== previousMsg.senderId) {
    return true;
  }
  
  // Show timestamp if more than 1 minute has passed (reduced from 5 minutes for better UX)
  try {
    const currentTime = new Date(currentMsg.timestamp).getTime();
    const previousTime = new Date(previousMsg.timestamp).getTime();
    
    // Validate timestamps
    if (isNaN(currentTime) || isNaN(previousTime)) {
      console.warn('Invalid timestamp in shouldShowTimestamp:', { currentMsg, previousMsg });
      return true; // Show timestamp if parsing fails
    }
    
    const diffMinutes = (currentTime - previousTime) / 60000;
    return diffMinutes > 1;
  } catch (error) {
    // If timestamp parsing fails, show it anyway
    console.warn('Error parsing timestamp in shouldShowTimestamp:', error);
    return true;
  }
};

