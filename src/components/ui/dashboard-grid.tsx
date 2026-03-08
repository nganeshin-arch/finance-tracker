import * as React from "react"
import { cn } from "../../lib/utils"

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns in the grid */
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  /** Enable staggered animation for children */
  enableStagger?: boolean
  /** Delay between staggered animations in milliseconds */
  staggerDelay?: number
  /** Gap between grid items */
  gap?: "sm" | "md" | "lg"
}

const DashboardGrid = React.forwardRef<HTMLDivElement, DashboardGridProps>(
  (
    {
      className,
      columns = 4,
      enableStagger = false,
      staggerDelay = 100,
      gap = "md",
      children,
      ...props
    },
    ref
  ) => {
    // Generate grid column classes
    const getGridCols = () => {
      switch (columns) {
        case 1:
          return "grid-cols-1"
        case 2:
          return "grid-cols-1 sm:grid-cols-2"
        case 3:
          return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        case 4:
          return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        case 5:
          return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        case 6:
          return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        default:
          return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      }
    }

    // Generate gap classes
    const getGapClass = () => {
      switch (gap) {
        case "sm":
          return "gap-3"
        case "md":
          return "gap-4"
        case "lg":
          return "gap-6"
        default:
          return "gap-4"
      }
    }

    // Apply staggered animation delays to children
    const staggeredChildren = React.useMemo(() => {
      if (!enableStagger) return children

      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            style: {
              ...child.props.style,
              animationDelay: `${index * staggerDelay}ms`,
            },
            className: cn(
              child.props.className,
              "animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            ),
          })
        }
        return child
      })
    }, [children, enableStagger, staggerDelay])

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          getGridCols(),
          getGapClass(),
          className
        )}
        {...props}
      >
        {staggeredChildren}
      </div>
    )
  }
)
DashboardGrid.displayName = "DashboardGrid"

export { DashboardGrid }