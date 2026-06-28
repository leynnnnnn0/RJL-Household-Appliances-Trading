import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  inputMode,
  onKeyDown,
  onPaste,
  ...props
}: React.ComponentProps<"input">) {
  const isNumberInput = type === "number"

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isNumberInput && ["e", "E", "+"].includes(event.key)) {
      event.preventDefault()
      return
    }

    onKeyDown?.(event)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (isNumberInput) {
      const pastedValue = event.clipboardData.getData("text")

      if (/[eE+]/.test(pastedValue)) {
        event.preventDefault()
        return
      }
    }

    onPaste?.(event)
  }

  return (
    <input
      type={type}
      inputMode={inputMode ?? (isNumberInput ? "decimal" : undefined)}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />
  )
}

export { Input }
