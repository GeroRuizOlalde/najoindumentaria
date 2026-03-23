import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  href?: string;
}

export function Logo({ className, variant = "dark", href = "/" }: LogoProps) {
  const content = (
    <div className={cn("flex flex-col items-center", className)}>
      <span
        className={cn(
          "font-heading text-2xl font-bold tracking-tight",
          variant === "dark" ? "text-black" : "text-white"
        )}
      >
        NAJO
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
