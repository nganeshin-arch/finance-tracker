import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

import { cn } from "../../lib/utils"
import { Card, CardContent } from "./card"

const statCardVariants = cva(
  "transition-all duration-250 ease-smooth",
  {
    variants: {
      variant: {
        default: "",
        premium: "bg-gradient-to-br from-card via-card to-accent/5",
        gradient: "",
      },
      trend: {
        positive: "border-l-4 border-l-income-500",
        negative: "border-l-4 border-l-expense-500",
        neutral: "border-l-4 border-l-neutral-500",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      trend: "none",
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  /** The label/title of the statistic */
  label: string
  /** The numerical value to display */
  value: number | string
  /** Optional icon component to display */
  icon?: React.ComponentType<{ className?: string }>
  /** Format function for the value (e.g., currency formatting) */
  formatValue?: (value: number | string) => string
  /** Trend direction for color coding */
  trend?: "positive" | "negative" | "neutral" | "none"
  /** Show trend arrow icon */
  showTrendIcon?: boolean
  /** Optional trend percentage or change value */
  trendValue?: string
  /** Apply gradient background to the card */
  useGradient?: boolean
  /** Custom gradient class (e.g., 'bg-gradient-income') */
  gradientClass?: string
  /** Make the card interactive and keyboard focusable */
  interactive?: boolean
  /** Custom ARIA label for screen readers */
  ariaLabel?: string
  /** ARIA role for the card */
  role?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      trend = "none",
      label,
      value,
      icon: Icon,
      formatValue,
      showTrendIcon = true,
      trendValue,
      useGradient = false,
      gradientClass,
      interactive = false,
      ariaLabel,
      role = "region",
      ...props
    },
    ref
  ) => {
    // Determine the effective variant
    const effectiveVariant = useGradient ? "gradient" : variant

    // Format the display value
    const displayValue = formatValue ? formatValue(value) : value

    // Determine trend icon and colors
    const getTrendIcon = () => {
      if (!showTrendIcon || trend === "none") return null
      
      switch (trend) {
        case "positive":
          return <ArrowUp className="h-4 w-4" aria-hidden="true" />
        case "negative":
          return <ArrowDown className="h-4 w-4" aria-hidden="true" />
        case "neutral":
          return <Minus className="h-4 w-4" aria-hidden="true" />
        default:
          return null
      }
    }

    const getTrendColorClass = () => {
      switch (trend) {
        case "positive":
          return "text-income-600 dark:text-income-400"
        case "negative":
          return "text-expense-600 dark:text-expense-400"
        case "neutral":
          return "text-neutral-600 dark:text-neutral-400"
        default:
          return ""
      }
    }

    const getBackgroundClass = () => {
      if (useGradient && gradientClass) {
        return gradientClass
      }
      
      switch (trend) {
        case "positive":
          return "bg-income-50 dark:bg-income-950/20"
        case "negative":
          return "bg-expense-50 dark:bg-expense-950/20"
        case "neutral":
          return "bg-neutral-50 dark:bg-neutral-950/20"
        default:
          return ""
      }
    }

    const getIconColorClass = () => {
      switch (trend) {
        case "positive":
          return "text-income-600 dark:text-income-400"
        case "negative":
          return "text-expense-600 dark:text-expense-400"
        case "neutral":
          return "text-neutral-600 dark:text-neutral-400"
        default:
          return "text-muted-foreground"
      }
    }

    const trendIcon = getTrendIcon()
    const trendColorClass = getTrendColorClass()
    const backgroundClass = getBackgroundClass()
    const iconColorClass = getIconColorClass()

    // Generate accessible label for screen readers
    const generateAriaLabel = () => {
      if (ariaLabel) return ariaLabel
      
      let label_text = `${label}: ${displayValue}`
      
      if (trend !== "none" && trendValue) {
        const trendText = trend === "positive" ? "up" : trend === "negative" ? "down" : "unchanged"
        label_text += `, ${trendText} ${trendValue}`
      } else if (trend !== "none") {
        const trendText = trend === "positive" ? "positive trend" : trend === "negative" ? "negative trend" : "neutral trend"
        label_text += `, ${trendText}`
      }
      
      return label_text
    }

    return (
      <Card
        ref={ref}
        className={cn(
          statCardVariants({ variant: effectiveVariant, trend }),
          backgroundClass,
          "hover:shadow-lg hover:-translate-y-0.5",
          className
        )}
        interactive={interactive}
        focusable={interactive}
        role={role}
        aria-label={generateAriaLabel()}
        {...props}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header with label and icon */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {label}
            </span>
            {Icon && (
              <Icon 
                className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColorClass)} 
                aria-hidden="true"
              />
            )}
          </div>

          {/* Value with bold typography and responsive sizing */}
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <p
              className={cn(
                "text-3xl sm:text-4xl font-bold leading-heading transition-all duration-250 truncate",
                trendColorClass || "text-foreground"
              )}
              title={displayValue.toString()}
            >
              {displayValue}
            </p>

            {/* Trend indicator with icon and optional value */}
            {(trendIcon || trendValue) && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold",
                  trendColorClass
                )}
              >
                {trendIcon}
                {trendValue && (
                  <span className="sr-only sm:not-sr-only">
                    {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Screen reader accessible trend description */}
          {trend !== "none" && (
            <span className="sr-only">
              {trend === "positive" && "Positive trend"}
              {trend === "negative" && "Negative trend"}
              {trend === "neutral" && "Neutral trend"}
              {trendValue && `, ${trendValue}`}
            </span>
          )}
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard, statCardVariants }
