import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedKeyIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

const AnimatedKeyIcon: React.FC<AnimatedKeyIconProps> = ({ 
  size = 80, 
  animated = true,
  className = "" 
}) => {
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const keyVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: animated ? [0, 10, -10, 0] : 0,
      transition: {
        duration: 3,
        repeat: animated ? Infinity : 0,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      variants={logoVariants}
      initial="initial"
      animate={animated ? ["animate", "pulse"] : "animate"}
    >
      <motion.div
        variants={keyVariants}
        className="relative"
        style={{ width: size * 0.7, height: size * 0.7 }}
      >
        {/* Animated Key Icon */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Key Handle (Circle) */}
          <motion.circle
            cx="20"
            cy="20"
            r="12"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Key Body (Rectangle) */}
          <motion.rect
            x="32"
            y="17"
            width="20"
            height="6"
            fill="url(#gradient1)"
            rx="3"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
          
          {/* Key Teeth */}
          <motion.rect
            x="48"
            y="23"
            width="8"
            height="4"
            fill="url(#gradient1)"
            rx="2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
          />
          <motion.rect
            x="44"
            y="27"
            width="6"
            height="4"
            fill="url(#gradient1)"
            rx="2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Glow Effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedKeyIcon; 