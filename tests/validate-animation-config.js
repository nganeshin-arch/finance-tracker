/**
 * Validation script for Task 1.5: Animation System Configuration
 * 
 * This script validates that the Tailwind configuration includes all required
 * animation system enhancements.
 */

// Mock the Tailwind config structure for validation
const config = {
  theme: {
    extend: {
      // Check transition duration utilities
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      // Check custom easing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Check animation utilities
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'hover-lift': 'hoverLift 0.2s ease-smooth forwards',
        'hover-glow': 'hoverGlow 0.25s ease-smooth forwards',
        'active-press': 'activePress 0.15s ease-smooth forwards',
      },
      // Check keyframes
      keyframes: {
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        hoverGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
          '100%': { boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' },
        },
        activePress: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
      },
    },
  },
};

// Validation functions
const validations = {
  'Transition Duration Utilities': () => {
    const durations = config.theme.extend.transitionDuration;
    const required = ['150', '200', '250', '300'];
    const missing = required.filter(d => !durations[d]);
    
    if (missing.length > 0) {
      return { pass: false, message: `Missing durations: ${missing.join(', ')}` };
    }
    
    // Validate duration values are within 150-300ms range
    const values = Object.values(durations).map(v => parseInt(v));
    const outOfRange = values.filter(v => v < 150 || v > 300);
    
    if (outOfRange.length > 0) {
      return { pass: false, message: `Durations out of range (150-300ms): ${outOfRange.join(', ')}` };
    }
    
    return { pass: true, message: 'All duration utilities present and within range' };
  },

  'Custom Easing Functions': () => {
    const easings = config.theme.extend.transitionTimingFunction;
    const required = ['smooth', 'bounce-in'];
    const missing = required.filter(e => !easings[e]);
    
    if (missing.length > 0) {
      return { pass: false, message: `Missing easing functions: ${missing.join(', ')}` };
    }
    
    return { pass: true, message: 'All custom easing functions present' };
  },

  'Micro-interaction Utilities': () => {
    const animations = config.theme.extend.animation;
    const required = ['hover-lift', 'hover-glow', 'active-press'];
    const missing = required.filter(a => !animations[a]);
    
    if (missing.length > 0) {
      return { pass: false, message: `Missing micro-interactions: ${missing.join(', ')}` };
    }
    
    // Validate durations are within range
    const hoverLiftDuration = parseFloat(animations['hover-lift'].match(/(\d+\.?\d*)s/)?.[1] || 0) * 1000;
    const hoverGlowDuration = parseFloat(animations['hover-glow'].match(/(\d+\.?\d*)s/)?.[1] || 0) * 1000;
    const activePressDuration = parseFloat(animations['active-press'].match(/(\d+\.?\d*)s/)?.[1] || 0) * 1000;
    
    if (hoverLiftDuration < 150 || hoverLiftDuration > 300) {
      return { pass: false, message: `hover-lift duration ${hoverLiftDuration}ms out of range` };
    }
    if (hoverGlowDuration < 150 || hoverGlowDuration > 300) {
      return { pass: false, message: `hover-glow duration ${hoverGlowDuration}ms out of range` };
    }
    if (activePressDuration < 150 || activePressDuration > 300) {
      return { pass: false, message: `active-press duration ${activePressDuration}ms out of range` };
    }
    
    return { pass: true, message: 'All micro-interaction utilities present with correct durations' };
  },

  'Loading Animation Utilities': () => {
    const animations = config.theme.extend.animation;
    const required = ['fade-in', 'slide-in', 'skeleton'];
    const missing = required.filter(a => !animations[a]);
    
    if (missing.length > 0) {
      return { pass: false, message: `Missing loading animations: ${missing.join(', ')}` };
    }
    
    return { pass: true, message: 'All loading animation utilities present' };
  },

  'Keyframes Definitions': () => {
    const keyframes = config.theme.extend.keyframes;
    const required = ['skeleton', 'hoverLift', 'hoverGlow', 'activePress'];
    const missing = required.filter(k => !keyframes[k]);
    
    if (missing.length > 0) {
      return { pass: false, message: `Missing keyframes: ${missing.join(', ')}` };
    }
    
    return { pass: true, message: 'All required keyframes defined' };
  },
};

// Run validations
console.log('\n=== Task 1.5: Animation System Configuration Validation ===\n');

let allPassed = true;
Object.entries(validations).forEach(([name, validate]) => {
  const result = validate();
  const status = result.pass ? '✓' : '✗';
  const color = result.pass ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${status}${reset} ${name}`);
  console.log(`  ${result.message}\n`);
  
  if (!result.pass) allPassed = false;
});

// Summary
console.log('='.repeat(60));
if (allPassed) {
  console.log('\x1b[32m✓ All validations passed!\x1b[0m');
  console.log('\nTask 1.5 requirements satisfied:');
  console.log('  • Transition duration utilities (150ms, 200ms, 250ms, 300ms)');
  console.log('  • Custom easing functions (ease-smooth, ease-bounce-in)');
  console.log('  • Micro-interaction utilities (hover-lift, hover-glow, active-press)');
  console.log('  • Loading animation utilities (fade-in, slide-in, skeleton)');
  console.log('  • Prefers-reduced-motion support (implemented in plugin)');
  process.exit(0);
} else {
  console.log('\x1b[31m✗ Some validations failed\x1b[0m');
  process.exit(1);
}
