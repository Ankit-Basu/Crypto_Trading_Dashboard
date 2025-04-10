'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Create a simplified Progress component that won't cause build errors
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ 
          width: `${value}%`,
          transform: 'none'
        }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
