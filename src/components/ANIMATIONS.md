# Animation System Documentation

This document describes the animation system implemented for the UI modernization project.

## Overview

The animation system provides smooth, performant animations throughout the application, enhancing user experience with:
- Page transition animations
- Micro-interactions for buttons and inputs
- Smooth loading transitions
- Staggered list animations
- Scroll-triggered animations

## Tailwind Animation Classes

### Available Animations

The following animation classes are available via Tailwind CSS:

```css
animate-fade-in          /* Simple fade in */
animate-fade-in-up       /* Fade in with upward movement */
animate-fade-in-down     /* Fade in with downward movement */
animate-slide-in         /* Slide in from top */
animate-slide-in-right   /* Slide in from left */
animate-slide-in-left    /* Slide in from right */
animate-scale-in         /* Scale up with fade */
animate-bounce-in        /* Bounce effect with fade */
animate-spin-slow        /* Slow spinning animation */
animate-pulse-slow       /* Slow pulsing animation */
```

### Usage Example

```tsx
<div className="animate-fade-in-up">
  Content that fades in and slides up
</div>

{/* With delay */}
<div 
  className="animate-fade-in-up" 
  style={{ animationDelay: '200ms', animationFillMode: 'both' }}
>
  Delayed animation
</div>
```

## Components

### PageTransition

Provides smooth fade-in animations when navigating between pages.

```tsx
import { PageTransition } from '@/components/PageTransition';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

### AnimatedList

Provides staggered animations for list items.

```tsx
import { AnimatedList } from '@/components/AnimatedList';

<AnimatedList staggerDelay={100}>
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</AnimatedList>
```

### AnimatedItem

Provides individual animation control for single elements.

```tsx
import { AnimatedItem } from '@/components/AnimatedList';

<AnimatedItem animation="fade-in-up" delay={200}>
  <Card>Content</Card>
</AnimatedItem>
```

## Hooks

### useInViewAnimation

Triggers animations when an element enters the viewport.

```tsx
import { useInViewAnimation } from '@/hooks/useAnimation';

const MyComponent = () => {
  const { ref, isInView } = useInViewAnimation();
  
  return (
    <div 
      ref={ref}
      className={isInView ? 'animate-fade-in-up' : 'opacity-0'}
    >
      Content animates when scrolled into view
    </div>
  );
};
```

### useLoadingTransition

Manages loading state transitions with smooth animations.

```tsx
import { useLoadingTransition } from '@/hooks/useAnimation';

const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, showContent } = useLoadingTransition(isLoading);
  
  return (
    <>
      {showLoading && <Loading />}
      {showContent && <Content />}
    </>
  );
};
```

### useRipple

Adds ripple effect on click (Material Design style).

```tsx
import { useRipple } from '@/hooks/useAnimation';

const MyButton = () => {
  const { createRipple } = useRipple();
  
  return (
    <button 
      onClick={createRipple}
      className="relative overflow-hidden"
    >
      Click me
    </button>
  );
};
```

## UI Component Enhancements

### Button

Buttons now include:
- Hover shadow effects
- Active scale-down effect (active:scale-95)
- Smooth transitions for all states
- Support for ripple effects

### Input

Inputs now include:
- Hover border color changes
- Focus ring with smooth transitions
- Border color transitions

### Card

Cards now include:
- Hover shadow enhancement
- Smooth transitions for all states
- Optional hover-lift utility class

### Select

Select components now include:
- Hover border effects
- Smooth dropdown animations
- Item hover transitions

## Utility Classes

### Custom Utilities

```css
.transition-smooth      /* Smooth cubic-bezier transition */
.hover-lift            /* Lift effect on hover */
.focus-ring            /* Focus ring with smooth transition */
.ripple                /* Ripple effect animation */
```

### Usage

```tsx
<Card className="hover-lift">
  Card with lift effect on hover
</Card>

<Input className="focus-ring" />
```

## Loading Components

### Loading Spinner

```tsx
import { Loading } from '@/components/ui/loading';

<Loading message="Loading data..." size="md" />
<Loading fullScreen message="Loading application..." />
```

### Skeleton Loaders

```tsx
import { 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton,
  ChartSkeleton,
  ListSkeleton 
} from '@/components/ui/loading';

<CardSkeleton />
<ListSkeleton items={5} />
<ChartSkeleton />
```

## Performance Considerations

1. **CSS Animations**: All animations use CSS animations/transitions for better performance
2. **GPU Acceleration**: Transform and opacity properties are used for GPU acceleration
3. **Animation Fill Mode**: Use `animationFillMode: 'both'` to prevent flashing
4. **Reduced Motion**: Consider adding support for `prefers-reduced-motion` media query

## Best Practices

1. **Consistency**: Use the same animation duration and easing across similar interactions
2. **Subtlety**: Keep animations subtle and quick (200-300ms for most interactions)
3. **Purpose**: Every animation should serve a purpose (feedback, guidance, delight)
4. **Performance**: Test animations on lower-end devices
5. **Accessibility**: Respect user preferences for reduced motion

## Examples

See `frontend/src/examples/AnimationsExample.tsx` for comprehensive examples of all animation features.

## Requirements Mapping

This implementation satisfies the following requirements:

- **3.1**: Hover effects with smooth transitions on interactive elements
- **3.2**: Subtle hover effects on cards (scale transformation)
- **3.3**: Smooth color transitions for pill-style buttons
- **3.4**: Hover-reveal action buttons with opacity transitions
- **3.5**: Modern shadows and smooth transitions for depth perception

## Browser Support

All animations are supported in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, animations gracefully degrade to instant state changes.
