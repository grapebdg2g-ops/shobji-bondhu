import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "warning" | "outline" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground active:bg-primary/90",
  accent: "bg-accent text-accent-foreground active:bg-accent/90",
  warning: "bg-[#E07A2C] text-white active:bg-[#c96a22]",
  outline: "bg-card text-foreground border border-border active:bg-muted",
  ghost: "bg-transparent text-foreground active:bg-muted",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-lg",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const BengaliButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "lg", fullWidth, loading, leftIcon, rightIcon, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-sm",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <span className="text-base font-semibold">লোড হচ্ছে...</span> : <>
        {leftIcon}
        {children}
        {rightIcon}
      </>}
    </button>
  ),
);
BengaliButton.displayName = "BengaliButton";