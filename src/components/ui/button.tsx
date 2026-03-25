import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants
            "bg-black text-white hover:bg-black/90": variant === "primary",
            "bg-white text-black border border-border hover:bg-off-white":
              variant === "secondary",
            "bg-transparent text-black hover:bg-off-white": variant === "ghost",
            "bg-error text-white hover:bg-error/90": variant === "destructive",
            "border border-border bg-transparent text-black hover:bg-off-white":
              variant === "outline",
            // Sizes
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-5 text-xs": size === "md",
            "h-12 px-8 text-sm": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
