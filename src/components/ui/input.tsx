import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-200 ease-smooth focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
        error: "border-destructive-500 focus-visible:border-destructive-600 focus-visible:ring-2 focus-visible:ring-destructive-500/20 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
        success: "border-success-500 focus-visible:border-success-600 focus-visible:ring-2 focus-visible:ring-success-500/20 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]",
      },
      inputSize: {
        default: "h-12 px-4 py-3",
        sm: "h-10 px-3 py-2",
        lg: "h-14 px-5 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string
  success?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, error, success, helperText, ...props }, ref) => {
    // Determine variant based on error/success props
    const effectiveVariant = error ? "error" : success ? "success" : variant
    
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(inputVariants({ variant: effectiveVariant, inputSize, className }))}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${props.id}-error` : 
            success ? `${props.id}-success` : 
            helperText ? `${props.id}-helper` : 
            undefined
          }
          {...props}
        />
        {error && (
          <p 
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in"
            role="alert"
          >
            <svg 
              className="w-4 h-4 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
        {success && !error && (
          <p 
            id={`${props.id}-success`}
            className="mt-1.5 text-sm text-success-600 dark:text-success-400 flex items-center gap-1.5 animate-fade-in"
          >
            <svg 
              className="w-4 h-4 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" 
                clipRule="evenodd" 
              />
            </svg>
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p 
            id={`${props.id}-helper`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
