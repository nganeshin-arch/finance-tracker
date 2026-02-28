import { useEffect, useState, useRef } from 'react';

/**
 * Hook to trigger animations when an element enters the viewport
 * Useful for scroll-triggered animations
 */
export const useInViewAnimation = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once animated, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
};

/**
 * Hook to manage loading state transitions with smooth animations
 */
export const useLoadingTransition = (isLoading: boolean, minDuration = 300) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
      setShowLoading(true);
    } else {
      // Ensure loading state shows for minimum duration for smooth UX
      const timer = setTimeout(() => {
        setShowLoading(false);
        setShowContent(true);
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDuration]);

  return { showLoading, showContent };
};

/**
 * Hook to add ripple effect on click
 */
export const useRipple = () => {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    // Remove ripple after animation
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  return { createRipple };
};
