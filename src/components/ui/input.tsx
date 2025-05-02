
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Create a ref that we'll use if no ref is provided
    const innerRef = React.useRef<HTMLInputElement>(null);
    const inputRef = ref || innerRef;

    // Handle keydown events specifically for delete and backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Call the original onKeyDown if it exists
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }

      // Ensure delete and backspace work as expected
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Prevent any default behavior that might be interfering
        e.stopPropagation();
        
        // If we have a ref to the input element, ensure focus
        if ('current' in inputRef && inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={inputRef}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
