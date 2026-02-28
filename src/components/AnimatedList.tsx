import React from 'react';
import { cn } from '../lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * AnimatedList component provides staggered fade-in animations for list items
 * Each child element will animate in with a slight delay after the previous one
 */
export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  className,
  staggerDelay = 50 
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'bounce-in';
}

/**
 * AnimatedItem component provides individual animation control for single elements
 */
export const AnimatedItem: React.FC<AnimatedItemProps> = ({ 
  children, 
  className,
  delay = 0,
  animation = 'fade-in-up'
}) => {
  return (
    <div
      className={cn(`animate-${animation}`, className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};
