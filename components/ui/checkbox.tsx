"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { cn } from "@/lib/utils"
// Extendemos las props para incluir nuestro booleano
export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  useAlternateIcon?: boolean;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, useAlternateIcon = false, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-input shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {/* Si `useAlternateIcon` es true, XIcon; si no, CheckIcon */}
        {useAlternateIcon
          ? <TfiLayoutLineSolid className="h-4 w-4" />
          : <CheckIcon className="h-4 w-4" />
        }
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
