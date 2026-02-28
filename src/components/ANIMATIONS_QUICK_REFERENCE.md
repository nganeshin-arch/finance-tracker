# Animation Quick Reference Guide

## Quick Start

### 1. Add Animation to Any Element

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Fade in with upward slide
<div className="animate-fade-in-up">Content</div>

// With delay
<div 
  className="animate-fade-in-up" 
  style={{ animationDelay: '200ms', animationFillMode: 'both' }}
>
  Delayed content
</div>
```

### 2. Animate Lists

```tsx
import { AnimatedList } from '@/components/AnimatedList';

<AnimatedList staggerDelay={100}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</AnimatedList>
```

### 3. Scroll-Triggered Animation

```tsx
import { useInViewAnimation } from '@/hooks/useAnimation';

const { ref, isInView } = useInViewAnimation();

<div ref={ref} className={isInView ? 'animate-fade-in-up' : 'opacity-0'}>
  Animates when scrolled into view
</div>
```

### 4. Loading Transitions

```tsx
import { useLoadingTransition } from '@/hooks/useAnimation';

const { showLoading, showContent } = useLoadingTransition(isLoading);

{showLoading && <Loading />}
{showContent && <Content />}
```

## Available Animation Classes

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-fade-in` | Fade in | 200ms |
| `animate-fade-in-up` | Fade in + slide up | 300ms |
| `animate-fade-in-down` | Fade in + slide down | 300ms |
| `animate-slide-in-right` | Slide from left | 300ms |
| `animate-slide-in-left` | Slide from right | 300ms |
| `animate-scale-in` | Scale up + fade | 200ms |
| `animate-bounce-in` | Bounce + fade | 500ms |

## Utility Classes

| Class | Effect |
|-------|--------|
| `hover-lift` | Lift up on hover with shadow |
| `transition-smooth` | Smooth cubic-bezier transition |
| `focus-ring` | Focus ring with smooth transition |

## Component Enhancements

All UI components now have built-in animations:

- **Buttons**: Hover shadow, active scale, smooth transitions
- **Inputs**: Hover border, focus ring, smooth transitions
- **Cards**: Hover shadow, smooth transitions
- **Selects**: Dropdown animations, item hover effects

## Common Patterns

### Card with Hover Effect

```tsx
<Card className="hover-lift cursor-pointer">
  <CardHeader>
    <CardTitle>Hover me</CardTitle>
  </CardHeader>
</Card>
```

### Button with Ripple Effect

```tsx
import { useRipple } from '@/hooks/useAnimation';

const { createRipple } = useRipple();

<button 
  onClick={createRipple}
  className="relative overflow-hidden"
>
  Click me
</button>
```

### Staggered Grid Animation

```tsx
<div className="grid grid-cols-3 gap-4">
  {items.map((item, i) => (
    <div
      key={item.id}
      className="animate-fade-in-up"
      style={{ 
        animationDelay: `${i * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      {item.content}
    </div>
  ))}
</div>
```

### Loading State with Skeleton

```tsx
import { CardSkeleton } from '@/components/ui/loading';

{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
) : (
  <div className="animate-fade-in">
    <YourContent />
  </div>
)}
```

## Best Practices

1. **Keep it subtle**: 200-300ms for most interactions
2. **Use delays wisely**: Stagger by 50-100ms for lists
3. **Combine animations**: Use `animationFillMode: 'both'` with delays
4. **Performance**: Prefer transform and opacity for animations
5. **Consistency**: Use the same animation for similar interactions

## Examples

See `frontend/src/examples/AnimationsExample.tsx` for live examples.
