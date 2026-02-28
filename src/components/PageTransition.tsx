import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition component provides smooth fade-in animations when navigating between pages
 * Uses CSS animations for better performance than JS-based solutions
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fade-out') {
      setTransitionStage('fade-in');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={cn(
        'animate-fade-in-up',
        transitionStage === 'fade-out' && 'opacity-0'
      )}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};
