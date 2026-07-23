import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-white placeholder:text-gray-500 selection:bg-blue-600 selection:text-white border-white/20 flex h-9 w-full min-w-0 rounded-md border bg-white/5 px-3 py-1 text-base text-white shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/30 aria-invalid:border-red-500/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
