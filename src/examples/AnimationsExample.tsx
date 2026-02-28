import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Loading, CardSkeleton } from '../components/ui/loading';
import { AnimatedList, AnimatedItem } from '../components/AnimatedList';
import { useInViewAnimation, useLoadingTransition } from '../hooks/useAnimation';

/**
 * AnimationsExample - Demonstrates all animation features
 * 
 * This example showcases:
 * 1. Page transition animations
 * 2. Micro-interactions for buttons and inputs
 * 3. Smooth loading transitions
 * 4. Staggered list animations
 * 5. Scroll-triggered animations
 */
export const AnimationsExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, showContent } = useLoadingTransition(isLoading);
  const { ref: scrollRef, isInView } = useInViewAnimation();

  const handleLoadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const listItems = [
    'Fade-in animation',
    'Slide-in animation',
    'Scale animation',
    'Bounce animation',
    'Staggered list animation',
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with fade-in animation */}
      <div className="animate-fade-in-down">
        <h1 className="text-4xl font-bold mb-2">Animation Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating smooth animations and transitions throughout the application
        </p>
      </div>

      {/* Button Micro-interactions */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle>Button Micro-interactions</CardTitle>
          <CardDescription>
            Buttons have hover effects, active states, and smooth transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </CardContent>
      </Card>

      {/* Input Micro-interactions */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle>Input Micro-interactions</CardTitle>
          <CardDescription>
            Inputs have focus states, hover effects, and smooth transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Type something..." />
          <Input placeholder="Another input field..." />
        </CardContent>
      </Card>

      {/* Loading Transitions */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle>Loading Transitions</CardTitle>
          <CardDescription>
            Smooth transitions between loading and content states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLoadData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load Data'}
          </Button>
          
          {showLoading && (
            <div className="space-y-4">
              <Loading message="Loading data..." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          )}
          
          {showContent && !isLoading && (
            <div className="animate-fade-in space-y-2">
              <p className="text-green-600 font-medium">✓ Data loaded successfully!</p>
              <p className="text-muted-foreground">
                Notice the smooth transition from loading to content state.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staggered List Animation */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle>Staggered List Animation</CardTitle>
          <CardDescription>
            List items animate in with a staggered delay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatedList className="space-y-2" staggerDelay={100}>
            {listItems.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {item}
              </div>
            ))}
          </AnimatedList>
        </CardContent>
      </Card>

      {/* Individual Animation Types */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle>Individual Animation Types</CardTitle>
          <CardDescription>
            Different animation styles for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatedItem animation="fade-in" delay={0}>
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-center">
              Fade In
            </div>
          </AnimatedItem>
          
          <AnimatedItem animation="fade-in-up" delay={100}>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
              Fade In Up
            </div>
          </AnimatedItem>
          
          <AnimatedItem animation="fade-in-down" delay={200}>
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg text-center">
              Fade In Down
            </div>
          </AnimatedItem>
          
          <AnimatedItem animation="slide-in-right" delay={300}>
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
              Slide In Right
            </div>
          </AnimatedItem>
          
          <AnimatedItem animation="slide-in-left" delay={400}>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-center">
              Slide In Left
            </div>
          </AnimatedItem>
          
          <AnimatedItem animation="scale-in" delay={500}>
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-center">
              Scale In
            </div>
          </AnimatedItem>
        </CardContent>
      </Card>

      {/* Scroll-triggered Animation */}
      <Card 
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        className={isInView ? 'animate-fade-in-up' : 'opacity-0'}
      >
        <CardHeader>
          <CardTitle>Scroll-triggered Animation</CardTitle>
          <CardDescription>
            This card animates when it enters the viewport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Scroll down to see this card animate into view. This technique is useful
            for creating engaging user experiences on long pages.
          </p>
        </CardContent>
      </Card>

      {/* Card Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift cursor-pointer">
          <CardHeader>
            <CardTitle>Hover Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This card lifts up on hover
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:scale-105 cursor-pointer">
          <CardHeader>
            <CardTitle>Hover Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This card scales up on hover
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:border-primary cursor-pointer">
          <CardHeader>
            <CardTitle>Hover Border</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This card's border changes on hover
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
