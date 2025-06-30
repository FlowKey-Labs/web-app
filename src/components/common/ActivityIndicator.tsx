import React from 'react';

interface ActivityIndicatorProps {
  /** Whether the indicator should be visible */
  visible?: boolean;
  /** Color of the indicator dot */
  color?: string;
  /** Size of the indicator dot in pixels */
  size?: number;
  /** Position from top edge */
  top?: string | number;
  /** Position from right edge */
  right?: string | number;
  /** Position from bottom edge */
  bottom?: string | number;
  /** Position from left edge */
  left?: string | number;
  /** Animation type */
  animation?: 'pulse' | 'bounce' | 'glow' | 'breathe' | 'none';
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Whether to show a subtle border */
  showBorder?: boolean;
  /** Border color */
  borderColor?: string;
  /** Custom className for additional styling */
  className?: string;
  /** Z-index value */
  zIndex?: number;
  /** Intensity of the glow effect (for glow animation) */
  glowIntensity?: 'subtle' | 'normal' | 'strong';
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  visible = false,
  color = '#ef4444', // red-500
  size = 8,
  top = '-2px',
  right = '-2px',
  bottom,
  left,
  animation = 'glow',
  animationDuration = 2,
  showBorder = true,
  borderColor = '#ffffff',
  className = '',
  zIndex = 50,
  glowIntensity = 'normal',
}) => {
  if (!visible) return null;

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'glow':
        return 'animate-ping';
      case 'breathe':
        return 'animate-pulse';
      case 'none':
      default:
        return '';
    }
  };

  const getGlowOpacity = () => {
    switch (glowIntensity) {
      case 'subtle':
        return 0.4;
      case 'normal':
        return 0.75;
      case 'strong':
        return 0.9;
      default:
        return 0.75;
    }
  };

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    top,
    right,
    bottom,
    left,
    zIndex,
    pointerEvents: 'none', // Ensure it doesn't interfere with clicks
  };

  const dotStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    border: showBorder ? `2px solid ${borderColor}` : 'none',
    animationDuration: `${animationDuration}s`,
  };

  const glowStyles: React.CSSProperties = {
    ...dotStyles,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: getGlowOpacity(),
  };

  return (
    <div
      style={positionStyles}
      className={`${className}`}
      role="status"
      aria-label="Activity indicator"
    >
      {/* Main dot */}
      <div
        style={dotStyles}
        className={`rounded-full shadow-sm ${animation !== 'glow' ? getAnimationClass() : ''}`}
      />
      
      {/* Glow effect for glow animation */}
      {animation === 'glow' && (
        <div
          style={glowStyles}
          className="rounded-full animate-ping"
        />
      )}
      
      {/* Breathe effect - softer alternative to glow */}
      {animation === 'breathe' && (
        <div
          style={{
            ...dotStyles,
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.6,
            transform: 'scale(1.5)',
          }}
          className="rounded-full animate-pulse"
        />
      )}
    </div>
  );
};

export default ActivityIndicator;

// Export some common presets for convenience
export const ActivityIndicatorPresets = {
  notification: {
    color: '#ef4444',
    size: 8,
    animation: 'glow' as const,
    animationDuration: 2,
  },
  warning: {
    color: '#f59e0b',
    size: 10,
    animation: 'pulse' as const,
    animationDuration: 1.5,
  },
  success: {
    color: '#10b981',
    size: 8,
    animation: 'breathe' as const,
    animationDuration: 3,
  },
  info: {
    color: '#3b82f6',
    size: 6,
    animation: 'pulse' as const,
    animationDuration: 2.5,
  },
}; 